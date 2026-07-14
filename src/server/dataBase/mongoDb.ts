import  mongoose  from 'mongoose';
import { UnexpectedError } from './../../common/errors'
class MongoDb {
    private mongoString:string;
    private mongoUser:string;
    private mongoPassword:string;
    constructor() {
        this.mongoString = process.env.MONGODB_STRING || 'Un';
        this.mongoUser = process.env.MONGODB_USER || 'Un';
        this.mongoPassword = process.env.MONGODB_PASSWORD || 'Un';
        // this.connectDb.bind(this);
    }

    _fillMongoStringWithPass():string {
        return this.mongoString.replace('<db_password>', this.mongoPassword);
    }

    async connectDb():Promise<void> {
        try {
            const fullDbString = this._fillMongoStringWithPass();
            await mongoose.connect(fullDbString);
            console.log('DB Connected');
        } catch (err) {
            throw new UnexpectedError(`Failed to connect to MongoDB`);
        }
    }
}

export default MongoDb;
