import React from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<p className={styles.code}>404</p>
				<h1>Page not found</h1>
				<p>The page you are looking for does not exist or has been moved.</p>
				<Link to="/">Return to homepage</Link>
			</section>
		</main>
	)
}
