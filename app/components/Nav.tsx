import React from 'react'
import styles from './styles/Nav.module.css'

function Nav() {
  return (
    <nav className={styles.navbar}>
        <div className={styles.navItem}>
            <ul>
                <li><a href="/order-list">Product List</a></li>
                <li><a href="/myprofile">My Profile</a></li>
                <li><a href="/">Log out</a></li>
            </ul>
        </div>
    </nav>
  )
}

export default Nav
