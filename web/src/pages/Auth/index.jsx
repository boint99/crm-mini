import { Outlet } from 'react-router-dom'
import styles from './AuthLayout.module.css'
import bgLogin from '@/assets/images/banner_image.png'

function Auth() {
  return (
    <div className={styles.loginContainer}>
      {/* Ảnh nền toàn màn hình */}
      <div className={styles.backgroundImage}>
        <img src={bgLogin} alt="Background" />
        <div className={styles.overlay}></div>
      </div>

      {/* Form wrapper bên phải */}
      <div className={styles.loginFormWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <h1 className={styles.logo}>IT-HELPDESK</h1>
            <p className={styles.subtitle}>Đăng nhập / Đăng ký để tiếp tục</p>
          </div>
          <Outlet />
          <div className={styles.footerText}>
                        PROFESSIONAL SUPPORT &amp; TECHNICAL SOLUTIONS
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth