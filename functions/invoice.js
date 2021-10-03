const admin = require('firebase-admin')
require('dotenv').config()

const serviceAccount = {
	type: process.env.FIREBASE_ADMIN_TYPE,
	project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
	private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.split('\\n').join('\n'),
	client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
	auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
	token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
	auth_provider_x509_cert_url:
		process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
	client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
}

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
})
const db = admin.firestore()

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

		const invoiceRequest = db.collection('dev-invoiceRequests').doc()
		await invoiceRequest.set({
			type: 'lnurl',
			amount,
		})
		const request = await new Promise((resolve, reject) => {
			let timer
			const unsubscribe = db
				.collection('dev-invoices')
				.doc(invoiceRequest.id)
				.onSnapshot((snapshot) => {
					const data = snapshot.data()
					if (data && data.request) {
						clearTimeout(timer)
						unsubscribe()
						resolve(data.request)
					}
				})
			timer = setTimeout(() => {
				unsubscribe()
				reject(new Error('Invoice creation timeout'))
			}, 5000)
		})

		return createResponse({
			pr: request,
			routes: [],
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
