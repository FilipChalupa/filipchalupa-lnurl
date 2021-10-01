import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp()

export const helloWorld = functions.https.onRequest((_, response) => {
	functions.logger.info('Hello logs!', { structuredData: true })
	response.send('Hello from Firebase!')
})

export const lnurl = functions.https.onRequest(async (request, response) => {
	const amount = parseInt(String(request.query.amount), 10) || 0
	const isTooLow = isNaN(amount) || amount < 10000
	const isTooHigh = amount > 100000000
	if (isTooLow || isTooHigh) {
		response.send({
			reason: isTooLow
				? 'Amount is too low.'
				: isTooHigh
				? 'Amount is too high.'
				: 'Something went wrong.',
			status: 'ERROR',
		})
		return
	}
	//functions.firestore.document('invoiceRequests')

	response.send({
		pr: 'xxx',
		routes: '',
		successAction: {
			message: 'Děkuji ⚡ Thank you',
			tag: 'message',
		},
	})
})
