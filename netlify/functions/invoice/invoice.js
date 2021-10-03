const createResponse = (payload, statusCode = 200) => ({
	statusCode,
	headers: {
		'Content-Type': 'application/json; charset=utf-8',
	},
	body: JSON.stringify(payload),
})

const handler = async (event) => {
	try {
		const amount = parseInt(String(event.queryStringParameters.amount), 10) || 0
		const isTooLow = isNaN(amount) || amount < 10000
		const isTooHigh = amount > 100000000
		if (isTooLow || isTooHigh) {
			return createResponse({
				reason: isTooLow
					? 'Amount is too low.'
					: isTooHigh
					? 'Amount is too high.'
					: 'Something went wrong.',
				status: 'ERROR',
			})
		}

		return createResponse({
			pr: 'xxx',
			routes: '',
			successAction: {
				message: 'Děkuji ⚡ Thank you',
				tag: 'message',
			},
		})
	} catch (error) {
		console.error(error)
		return createResponse(500, {
			reason: 'Something went wrong.',
			status: 'Error',
		})
	}
}

module.exports = { handler }
