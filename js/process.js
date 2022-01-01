const id = localStorage.getItem('id')
if (id === null) {
	window.open('index.html', '_top')
} else {
	const statusUrl = `${server}/status?id=${id}`
	const checker = setInterval(() => {
		fetch(statusUrl)
			.then((response) => {
				if (response.ok) {
					return response.json()
				} else {
					localStorage.removeItem('id')
					window.open('index.html', '_top')
				}
			})
			.then((json) => {
				const ready = json.ready
				const downloadUrl = `${server}/download?id=${id}`
				if (ready) {
					window.open(downloadUrl, '_self')
					$id('loadingRing').style.display = 'none'
					$id('doneMessage').style.display = 'block'
					clearInterval(checker)
				}
			})
	}, 1000)
}
