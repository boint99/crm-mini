#TRIỂN KHAI XÁC THỰC JWT & QUẢN LÝ NGƯỜI DÙNG

## 1. Vai trò & Ngữ cảnh

**Đặc biệt lưu ý về kiến trúc:**
- Yêu cầu thiết kế mã nguồn tuân thủ chặt chẽ mô hình Hướng đối tượng (OOP)
- Các Database Models và Services phải được thiết kế dưới dạng các Class và khởi tạo thông qua Object Instances (ví dụ: `new UserModel()`)
- Tuyệt đối không sử dụng các static methods
- Database: **PostgreSQL** với pool connection
- Token Strategy: **Access Token + Refresh Token** (cấu hình từ env variables)

---

## 2. Mục tiêu

Sau khi thực hiện quy trình, các module sau phải hoạt động hoàn hảo:

- **API Đăng ký (Register):** Tiếp nhận thông tin, kiểm tra tính duy nhất, mã hóa mật khẩu an toàn và lưu vào PostgreSQL
- **API Đăng nhập (Login):** Xác thực danh tính, cấp phát **Access Token** + **Refresh Token**, lưu refresh token vào DB
- **API Refresh Token:** Sử dụng refresh token hợp lệ để lấy access token mới
- **API Logout:** Revoke refresh token từ cơ sở dữ liệu
- **Auth Middleware:** Lọc và bảo vệ các API dùng chung, chỉ cho phép các request có chứa JWT hợp lệ đi qua

---

## 3. Cấu hình Environment Variables

Tạo file `.env` với các biến sau:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_min_32_chars_needed
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars_needed

# Token Expiration (theo chuẩn JWT)
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server Configuration
PORT=8017
NODE_ENV=development
```

**Lưu ý:**
- `JWT_ACCESS_EXPIRY`: Access token ngắn hạn (15 phút - 1 giờ)
- `JWT_REFRESH_EXPIRY`: Refresh token dài hạn (7 ngày - 30 ngày)
- Secret keys phải có độ dài tối thiểu 32 ký tự

---

## 4. Cấu trúc Database (PostgreSQL)

### Table: `accounts`



### Table: `refresh_tokens`


## 5. Quy trình thực hiện chi tiết

> **Lưu ý cho AI:** Hãy thực hiện theo trình tự. Viết code rõ ràng, có comment giải thích cho từng khối logic quan trọng.

### Bước 1: Khởi tạo Database Connection (OOP Pattern)

Tạo class `DatabaseClient` để quản lý pool connection:

```javascript
// database/DatabaseClient.js
const { Pool } = require('pg');

class DatabaseClient {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      min: parseInt(process.env.DATABASE_POOL_MIN) || 2,
      max: parseInt(process.env.DATABASE_POOL_MAX) || 10
    });

    this.pool.on('error', (error) => {
      console.error('Unexpected error on idle client', error);
    });
  }

  /**
   * Thực thi query và trả về kết quả
   * @param {string} query - SQL query string
   * @param {array} values - Parameterized values
   */
  async query(query, values = []) {
    const client = await this.pool.connect();
    try {
      return await client.query(query, values);
    } finally {
      client.release();
    }
  }

  /**
   * Đóng pool connection
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = new DatabaseClient();
```

---

### Bước 2: Xây dựng Model UserModel (OOP Pattern)

Tạo class `UserModel` để tương tác với database:

```javascript
// models/UserModel.js
const database = require('../database/DatabaseClient');
const bcrypt = require('bcrypt');

class UserModel {
  constructor() {
    this.tableName = 'users';
  }

  /**
   * Tìm user theo username
   * @param {string} username
   * @returns {Object|null}
   */
  async findByUsername(username) {
    const result = await database.query(
      `SELECT * FROM ${this.tableName} WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  }

  /**
   * Tìm user theo email
   * @param {string} email
   * @returns {Object|null}
   */
  async findByEmail(email) {
    const result = await database.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Tìm user theo ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findById(id) {
    const result = await database.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Tạo user mới
   * @param {Object} userData - { username, email, password }
   * @returns {Object} - User record vừa tạo
   */
  async createUser(userData) {
    const { username, email, password } = userData;

    // Hash password với salt rounds = 10
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await database.query(
      `INSERT INTO ${this.tableName} (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );

    return result.rows[0];
  }

  /**
   * Xác thực mật khẩu
   * @param {string} plainPassword
   * @param {string} hashedPassword
   * @returns {boolean}
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Cập nhật user
   * @param {number} id
   * @param {Object} updateData
   * @returns {Object}
   */
  async updateUser(id, updateData) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    values.push(id);

    const result = await database.query(
      `UPDATE ${this.tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }
}

module.exports = UserModel;
```

---

### Bước 3: Xây dựng Model RefreshTokenModel

Tạo class `RefreshTokenModel` để quản lý refresh tokens:

```javascript
// models/RefreshTokenModel.js
const database = require('../database/DatabaseClient');

class RefreshTokenModel {
  constructor() {
    this.tableName = 'refresh_tokens';
  }

  /**
   * Lưu refresh token vào database
   * @param {number} userId
   * @param {string} token
   * @param {Date} expiresAt
   * @returns {Object}
   */
  async createRefreshToken(userId, token, expiresAt) {
    const result = await database.query(
      `INSERT INTO ${this.tableName} (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token, expires_at`,
      [userId, token, expiresAt]
    );

    return result.rows[0];
  }

  /**
   * Tìm refresh token theo token string
   * @param {string} token
   * @returns {Object|null}
   */
  async findByToken(token) {
    const result = await database.query(
      `SELECT * FROM ${this.tableName}
       WHERE token = $1 AND is_revoked = FALSE`,
      [token]
    );

    return result.rows[0] || null;
  }

  /**
   * Kiểm tra token có hợp lệ không (chưa hết hạn và chưa revoke)
   * @param {string} token
   * @returns {boolean}
   */
  async isTokenValid(token) {
    const result = await database.query(
      `SELECT * FROM ${this.tableName}
       WHERE token = $1 AND is_revoked = FALSE AND expires_at > NOW()`,
      [token]
    );

    return result.rows.length > 0;
  }

  /**
   * Revoke refresh token (logout)
   * @param {string} token
   * @returns {boolean}
   */
  async revokeToken(token) {
    const result = await database.query(
      `UPDATE ${this.tableName}
       SET is_revoked = TRUE
       WHERE token = $1`,
      [token]
    );

    return result.rowCount > 0;
  }

  /**
   * Revoke tất cả tokens của user (logout all devices)
   * @param {number} userId
   * @returns {number} - Số tokens bị revoke
   */
  async revokeAllUserTokens(userId) {
    const result = await database.query(
      `UPDATE ${this.tableName}
       SET is_revoked = TRUE
       WHERE user_id = $1 AND is_revoked = FALSE`,
      [userId]
    );

    return result.rowCount;
  }

  /**
   * Xóa refresh tokens đã hết hạn
   * @returns {number} - Số records bị xóa
   */
  async deleteExpiredTokens() {
    const result = await database.query(
      `DELETE FROM ${this.tableName}
       WHERE expires_at < NOW()`
    );

    return result.rowCount;
  }
}

module.exports = RefreshTokenModel;
```

---

### Bước 4: Xử lý Đăng ký (Register Logic)

```javascript
// controllers/AuthController.js
const UserModel = require('../models/UserModel');

class AuthController {
  /**
   * POST /auth/register
   * Xử lý đăng ký user mới
   */
  async register(req, res) {
    try {
      const { username, email, password, confirmPassword } = req.body;

      // ===== VALIDATION =====
      // Kiểm tra dữ liệu bắt buộc
      if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin',
          code: 'MISSING_FIELDS'
        });
      }

      // Kiểm tra password khớp
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu xác nhận không khớp',
          code: 'PASSWORD_MISMATCH'
        });
      }

      // Kiểm tra độ dài username (6-50 ký tự)
      if (username.length < 6 || username.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Username phải từ 6 đến 50 ký tự',
          code: 'INVALID_USERNAME_LENGTH'
        });
      }

      // Kiểm tra format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email không hợp lệ',
          code: 'INVALID_EMAIL'
        });
      }

      // Kiểm tra độ dài password (tối thiểu 8 ký tự)
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải tối thiểu 8 ký tự',
          code: 'WEAK_PASSWORD'
        });
      }

      // Kiểm tra password có ít nhất: 1 số, 1 ký tự đặc biệt, 1 chữ hoa
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt',
          code: 'INVALID_PASSWORD_FORMAT'
        });
      }

      // ===== KIỂM TRA TRÙNG LẶP =====
      const userModel = new UserModel();

      const existingUsername = await userModel.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'Username đã tồn tại',
          code: 'USERNAME_EXISTS'
        });
      }

      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được đăng ký',
          code: 'EMAIL_EXISTS'
        });
      }

      // ===== TẠO USER MỚI =====
      const newUser = await userModel.createUser({
        username,
        email,
        password
      });

      return res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
          userId: newUser.id,
          username: newUser.username,
          email: newUser.email,
          createdAt: newUser.created_at
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng ký',
        code: 'SERVER_ERROR'
      });
    }
  }
}

module.exports = AuthController;
```

---

### Bước 5: Xử lý Đăng nhập & Cấp phát Token (Login Logic)

```javascript
// controllers/AuthController.js (tiếp theo)
const jwt = require('jsonwebtoken');
const RefreshTokenModel = require('../models/RefreshTokenModel');

class AuthController {
  /**
   * POST /auth/login
   * Xác thực user và cấp phát Access Token + Refresh Token
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // ===== VALIDATION =====
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username và password là bắt buộc',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // ===== TÌM USER =====
      const userModel = new UserModel();
      const user = await userModel.findByUsername(username);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Username hoặc password không chính xác',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // ===== XÁC THỰC MẬT KHẨU =====
      const isPasswordValid = await userModel.verifyPassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Username hoặc password không chính xác',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // ===== TẠO ACCESS TOKEN =====
      const accessTokenPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        type: 'access'
      };

      const accessToken = jwt.sign(
        accessTokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
      );

      // ===== TẠO REFRESH TOKEN =====
      const refreshTokenPayload = {
        userId: user.id,
        type: 'refresh'
      };

      const refreshToken = jwt.sign(
        refreshTokenPayload,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
      );

      // ===== LƯU REFRESH TOKEN VÀO DATABASE =====
      const refreshTokenModel = new RefreshTokenModel();
      const decodedRefreshToken = jwt.decode(refreshToken);
      const expiresAt = new Date(decodedRefreshToken.exp * 1000); // Convert Unix timestamp to Date

      await refreshTokenModel.createRefreshToken(
        user.id,
        refreshToken,
        expiresAt
      );

      // ===== RETURN RESPONSE =====
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          userId: user.id,
          username: user.username,
          email: user.email,
          accessToken,
          refreshToken,
          accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng nhập',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * POST /auth/refresh-token
   * Sử dụng refresh token để lấy access token mới
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token là bắt buộc',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      // ===== KIỂM TRA REFRESH TOKEN =====
      let decoded;
      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token không hợp lệ hoặc đã hết hạn',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      // ===== KIỂM TRA TOKEN CÓ TRONG DATABASE KHÔNG =====
      const refreshTokenModel = new RefreshTokenModel();
      const isValidToken = await refreshTokenModel.isTokenValid(refreshToken);

      if (!isValidToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token đã bị revoke hoặc hết hạn',
          code: 'REVOKED_REFRESH_TOKEN'
        });
      }

      // ===== LẤY THÔNG TIN USER =====
      const userModel = new UserModel();
      const user = await userModel.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User không tồn tại',
          code: 'USER_NOT_FOUND'
        });
      }

      // ===== TẠO ACCESS TOKEN MỚI =====
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
      );

      return res.status(200).json({
        success: true,
        message: 'Refresh token thành công',
        data: {
          accessToken: newAccessToken,
          accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi làm mới token',
        code: 'SERVER_ERROR'
      });
    }
  }
}

module.exports = AuthController;
```

---

### Bước 6: Viết Auth Middleware (Xác thực)

```javascript
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT
 * Kiểm tra Access Token từ Authorization header
 * Format: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  try {
    // ===== TRÍCH XUẤT TOKEN =====
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp hoặc định dạng không hợp lệ',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Bỏ "Bearer " (7 ký tự)

    // ===== KIỂM TRA TOKEN =====
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token đã hết hạn',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ',
          code: 'INVALID_TOKEN'
        });
      }
      throw error;
    }

    // ===== KIỂM TRA TOKEN TYPE =====
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Token type không hợp lệ',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // ===== GÁN USER DATA VÀO REQUEST =====
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = authMiddleware;
```

---

### Bước 7: Xử lý Logout (Revoke Token)

```javascript
// controllers/AuthController.js (tiếp theo)

class AuthController {
  /**
   * POST /auth/logout
   * Revoke refresh token (logout single device)
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.userId; // Lấy từ authMiddleware

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token là bắt buộc',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      // ===== REVOKE TOKEN =====
      const refreshTokenModel = new RefreshTokenModel();
      const isRevoked = await refreshTokenModel.revokeToken(refreshToken);

      if (!isRevoked) {
        return res.status(400).json({
          success: false,
          message: 'Không thể revoke token',
          code: 'REVOKE_FAILED'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công'
      });

    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng xuất',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * POST /auth/logout-all
   * Revoke tất cả refresh tokens của user (logout all devices)
   */
  async logoutAll(req, res) {
    try {
      const userId = req.user.userId; // Lấy từ authMiddleware

      // ===== REVOKE ALL TOKENS =====
      const refreshTokenModel = new RefreshTokenModel();
      const revokedCount = await refreshTokenModel.revokeAllUserTokens(userId);

      return res.status(200).json({
        success: true,
        message: `Đã đăng xuất khỏi ${revokedCount} thiết bị`,
        data: {
          revokedDevices: revokedCount
        }
      });

    } catch (error) {
      console.error('Logout all error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng xuất khỏi tất cả thiết bị',
        code: 'SERVER_ERROR'
      });
    }
  }
}

module.exports = AuthController;
```

---

## 6. Cấu hình Routes (Express)

```javascript
// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

const authController = new AuthController();

// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));

// Protected routes (require authMiddleware)
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));
router.post('/logout-all', authMiddleware, (req, res) => authController.logoutAll(req, res));

module.exports = router;
```

---

## 7. Cấu hình Express App

```javascript
// app.js
const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);

// ===== PROTECTED ROUTE EXAMPLE =====
const authMiddleware = require('./middlewares/authMiddleware');

app.get('/api/profile', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile data',
    data: req.user
  });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 8. Các nguyên tắc nghiêm ngặt (Constraints)

✔️ **PHẢI TUÂN THỦ**

- ✅ **LUÔN LUÔN** khởi tạo object (instance) cho các thao tác model/service thay vì dùng hàm static
  ```javascript
  // ĐÚNG ✓
  const userModel = new UserModel();
  const user = await userModel.findByUsername(username);

  // SAI ✗
  const user = await UserModel.findByUsername(username); // Static method
  ```

- ✅ **LUÔN** sử dụng parameterized queries để tránh SQL Injection
  ```javascript
  // ĐÚNG ✓
  await database.query('SELECT * FROM users WHERE username = $1', [username]);

  // SAI ✗
  await database.query(`SELECT * FROM users WHERE username = '${username}'`);
  ```

- ✅ **LUÔN** sử dụng environment variables cho sensitive data
  ```javascript
  // ĐÚNG ✓
  const secret = process.env.JWT_SECRET;

  // SAI ✗
  const secret = 'my-secret-key-hardcoded';
  ```

---

❌ **TUYỆT ĐỐI KHÔNG**

- ❌ **KHÔNG** lưu mật khẩu dạng plain-text (chưa mã hóa) vào cơ sở dữ liệu
- ❌ **KHÔNG** hardcode Secret Key hoặc thông tin nhạy cảm trong file code
- ❌ **KHÔNG** trả về password hash cho client
- ❌ **KHÔNG** sử dụng static methods cho database operations
- ❌ **KHÔNG** xây dựng SQL queries từ string concatenation hoặc template literals

---

## 9. Xử lý Ngoại lệ (Error Handling)

Tất cả các API endpoints phải:

1. **Try/Catch** tất cả async operations
2. **Trả về JSON response chuẩn:**
   ```javascript
   {
     "success": true/false,
     "message": "Thông báo cho user",
     "code": "ERROR_CODE",
     "data": { /* optional */ }
   }
   ```

3. **HTTP Status Codes:**
   - `200` - OK, thành công
   - `201` - Created, tạo mới thành công
   - `400` - Bad Request, dữ liệu không hợp lệ
   - `401` - Unauthorized, không được phép truy cập
   - `409` - Conflict, dữ liệu trùng lặp
   - `500` - Internal Server Error

---

## 10. Yêu cầu bổ sung & Best Practices

### 10.1 Rate Limiting

```javascript
// middlewares/rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // 5 lần login thất bại
  message: 'Quá nhiều lần login thất bại, vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, (req, res) => authController.login(req, res));
```

### 10.2 Logging & Audit Trail

```javascript
// utils/logger.js
const fs = require('fs');
const path = require('path');

class Logger {
  static log(event, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${event}: ${JSON.stringify(data)}\n`;
    fs.appendFileSync(path.join(__dirname, '../logs/auth.log'), logMessage);
  }
}

// Sử dụng trong login
Logger.log('LOGIN_ATTEMPT', { username, success: isPasswordValid });
Logger.log('LOGIN_SUCCESS', { userId: user.id, timestamp: new Date() });
```

### 10.3 Kiểm tra Token hết hạn định kỳ

```javascript
// jobs/tokenCleanup.js
const schedule = require('node-schedule');
const RefreshTokenModel = require('../models/RefreshTokenModel');

// Chạy mỗi ngày lúc 2 AM
schedule.scheduleJob('0 2 * * *', async () => {
  const refreshTokenModel = new RefreshTokenModel();
  const deletedCount = await refreshTokenModel.deleteExpiredTokens();
  console.log(`Deleted ${deletedCount} expired tokens`);
});
```

### 10.4 CORS Configuration

```javascript
// app.js
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

---

## 11. Testing Checklist

### 11.1 Register Tests

- [ ] Đăng ký thành công với dữ liệu hợp lệ
- [ ] Từ chối nếu username đã tồn tại (409)
- [ ] Từ chối nếu email đã tồn tại (409)
- [ ] Từ chối nếu password không đủ mạnh (400)
- [ ] Từ chối nếu thiếu dữ liệu bắt buộc (400)
- [ ] Password được hash và lưu an toàn

### 11.2 Login Tests

- [ ] Đăng nhập thành công với credentials đúng
- [ ] Trả về access token + refresh token
- [ ] Từ chối nếu username sai (401)
- [ ] Từ chối nếu password sai (401)
- [ ] Refresh token được lưu vào database

### 11.3 Refresh Token Tests

- [ ] Lấy access token mới từ refresh token hợp lệ
- [ ] Từ chối nếu refresh token hết hạn
- [ ] Từ chối nếu refresh token đã bị revoke

### 11.4 Auth Middleware Tests

- [ ] Cho phép request nếu token hợp lệ
- [ ] Từ chối nếu token bị revoke (401)
- [ ] Từ chối nếu token hết hạn (401)
- [ ] Từ chối nếu thiếu Authorization header (401)

### 11.5 Logout Tests

- [ ] Logout thành công revoke token
- [ ] Logout all thành công revoke tất cả tokens

---

## 12. Cấu trúc thư mục dự án

```
src/
├── config/
│   └── database.js
├── modules/
│   ├── accounts
│   └── auth
        |
        ├── auth.controller.js
        ├── auth.middleware.js
        ├── auth.routes.js
        ├── account.model.js
        └── refresh.token.model.js
├── middlewares/
│   └── auth.middleware.js
├── routes/
│   └── authRoutes.js
├── utils/
│   └── authentication.js
├── .env
├── .env.example
├── server.js
├── package.json
└── auth.md
```

---

## 13. Package Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.10.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "express-rate-limit": "^6.7.0",
    "node-schedule": "^2.1.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

---

## 14. Lời kết

Quy trình này cung cấp một nền tảng **an toàn**, **bảo mật** và **dễ bảo trì** cho hệ thống xác thực JWT với:

✅ PostgreSQL database
✅ Access Token + Refresh Token strategy
✅ Revoke token functionality
✅ OOP pattern strict compliance
✅ Comprehensive error handling
✅ Security best practices

**Hãy tuân thủ chặt chẽ từng bước để đảm bảo chất lượng code!**