import React from 'react'
import styles from './EditPostPage.module.css'

export default function EditPostPage() {
	return (
		<main className={styles.page}>
			<section className={styles.wrapper}>
				<h1>Edit Post</h1>
				<p>Update your article and keep your readers informed.</p>

				<form className={styles.form}>
					<label htmlFor="editTitle">Title</label>
					<input id="editTitle" type="text" defaultValue="Designing a Morning Writing Ritual" required />

					<label htmlFor="editExcerpt">Excerpt</label>
					<textarea id="editExcerpt" rows="3" defaultValue="A practical framework to build a consistent creative habit." required />

					<label htmlFor="editContent">Content</label>
					<textarea
						id="editContent"
						rows="8"
						defaultValue="Writers often wait for motivation, but momentum comes from routines..."
						required
					/>

					<div className={styles.actions}>
						<button type="button" className={styles.deleteBtn}>Delete Post</button>
						<button type="submit" className={styles.saveBtn}>Save Changes</button>
					</div>
				</form>
			</section>
		</main>
	)
}
