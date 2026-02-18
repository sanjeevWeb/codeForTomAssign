import express, { Application } from 'express'
import envValues from './config/config'
import userRoute from './routes/user.route'
import planRoute from './routes/plans.route'
import subsRoute from './routes/subscription.route'
import usageRoute from './routes/usage.route'

const app: Application = express()
const PORT = envValues.PORT || 5000

app.use(express.json())

//Registering routes
app.use('/user', userRoute)
app.use('/plan', planRoute)
app.use('/subs', subsRoute)
app.use('/api', usageRoute)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})