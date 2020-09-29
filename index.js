/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {

	app.on(['issues.opened', "issues.labeled"], async context => {
		let github = context.github
		let payload = context.payload
		const config = await context.config('project-assign.yml')

		async function getLabelsList() {
			let labels = await github.issues.listLabelsOnIssue({owner, repo, issue_number})
			labels = labels.data
			let labels_list = []
			for (let i in labels) {
				labels_list[i] = labels[i].name
			}

			return labels_list
		}


		let owner = payload.issue.user.login
		let repo = payload.repository.name
		let issue_number = payload.issue.number
		let target_labels = await getLabelsList()
		let target_name = ''

		for (let project in config) {
			let labels = config[project].labels
			for (let label of labels) {
				if (target_labels.includes(label)) {
					target_name = project
				}
			}
		}

		let projects = await github.projects.listForRepo({owner, repo})
		let project_id = 0

		for (let i = 0; i < projects.data.length; i++) {
			let project = projects.data[i]
			if (project.name === target_name) {
				project_id = project.id
				break
			}
		}

		let columns = await github.projects.listColumns({project_id})
		let column_id = columns.data[0].id
		let issue_id = payload.issue.id

		await github.projects.createCard({column_id, content_id: issue_id, content_type: 'Issue'})
	})
}
