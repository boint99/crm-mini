import { Outlet } from 'react-router-dom'
import styles from './AuthLayout.module.css'
import bgLogin from '@/assets/images/banner_image.png'
import logoImg from '@/assets/images/logo.png'

function Auth() {
  return (
    <div className={styles.loginContainer}>
      {/* Cột trái: Banner ảnh phong cảnh đẹp mắt */}
      <div className={styles.leftBanner}>
        <img src={bgLogin} alt="IT Helpdesk Landscape" className={styles.bannerImage} />
        <div className={styles.bannerOverlay}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoImageWrapper}>
              <img src={logoImg} alt="Logo" className={styles.logoImage} />
            </div>
            <div className={styles.logoTextGroup}>
              <h1 className={styles.logoTitle}>IT-Helpdesk</h1>
              <p className={styles.logoSubtitle}>Management System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập nổi bật trên nền xám nhẹ */}
      <div className={styles.rightContent}>
        <div className={styles.loginCard}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Auth