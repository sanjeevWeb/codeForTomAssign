import * as dotenv from 'dotenv'

dotenv.config()

interface EnvValues {
    PORT: number;
    NODE_ENV: string;
}
const envValues: EnvValues = {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

}

export default envValues