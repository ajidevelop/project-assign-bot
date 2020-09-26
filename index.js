/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
	// Your code here
	app.log.info('Yay, the app was loaded!')

	app.on('issues.edited', async context => {
		let github = context.github
		let payload = context.payload


		let owner = payload.issue.user.login
		let repo = payload.repository.name
		let issue_number = payload.issue.number
		let labels = await github.issues.listLabelsOnIssue({owner, repo, issue_number})
		for (let i in labels.data) {
			let data = labels.data[i]
			var isBug = data.name === 'bug'
			if (isBug)
				break;
		}

		let projects = await github.projects.listForRepo({owner, repo})
		let project_id = projects.data[0].id
		let project = await github.projects.listColumns({project_id})
		let column = await github.projects.listCards({project_id: project.data[0].id})
		console.log(column)


	})

	// For more information on building apps:
	// https://probot.github.io/docs/

	// To get your app running against GitHub, see:
	// https://probot.github.io/docs/development/
}
