const $id = (id) => document.getElementById(id)
const server = 'http://52.221.197.55:5000'
let url = undefined

const getId = (url) => {
	const regExp =
		/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
	const match = url.match(regExp)

	return match && match[2].length === 11 ? match[2] : null
}

const secondsToHMS = (seconds) => {
	const format = (n) =>
		n.toLocaleString('en-US', {
			minimumIntegerDigits: 2,
			useGrouping: false,
		})

	const hour = format(Math.floor(seconds / 3600))
	const minutes = format(Math.floor((seconds % 3600) / 60))

	return `${hour}:${minutes}:${seconds % 60}`
}

const HMSToSeconds = (hms) => {
	let p = hms.split(':'),
		s = 0
	for (let m = 1; p.length > 0; m *= 60) s += m * parseInt(p.pop(), 10)
	return s
}

const renderData = (data) => {
	url = data.url
	const id = getId(data.url)
	$id(
		'iframeWrapper'
	).innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
	$id('title').textContent = data.title
	$id('channelName').textContent = data.author
	$id('endTime').value = secondsToHMS(data.duration)
}

$id('search').onclick = () => {
	$id('loadingRing').style.opacity = '100%'
	const url = $id('url').value
	const requestUrl = `${server}/metadata?url=${encodeURIComponent(url)}`
	fetch(requestUrl)
		.then((response) => {
			if (response.ok) {
				return response.json()
			} else {
				throw new URIError('Video not Found')
			}
		})
		.then((data) => {
			renderData(data.data)
			$id('main').style.opacity = '0%'
			setTimeout(() => {
				$id('main').style.display = 'none'
			}, 300)
		})
		.catch((err) => {
			const error = $id('error')
			error.textContent = 'Error: ' + err.message
			error.style.opacity = '100%'
			error.classList.add('pulse')
			setTimeout(() => {
				error.classList.remove('pulse')
			}, 150)
		})
		.finally(() => {
			$id('loadingRing').style.opacity = '0%'
		})
}

$id('process').onclick = () => {
	const start = HMSToSeconds($id('startTime').value)
	const end = HMSToSeconds($id('endTime').value)

	const data = {
		url: url,
		start: start,
		end: end,
	}
	const requestUrl = `${server}/process`
	fetch(requestUrl, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
		},
	})
		.then((response) => {
			if (response.ok) {
				return response.json()
			} else {
				alert('An Error Occured!')
			}
		})
		.then((json) => {
			localStorage.setItem('id', json.id)
			window.open('process.html', '_top')
		})
}

document.querySelectorAll('.time-input').forEach((timeInput) => {
	const regex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/
	timeInput.addEventListener('input', () => {
		if (!regex.test(timeInput.value)) {
			timeInput.style.backgroundColor = 'var(--light-red)'
		} else {
			timeInput.style.backgroundColor = 'var(--white)'
		}
	})
})
