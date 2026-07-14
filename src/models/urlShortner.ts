/* eslint-disable func-names */
import  koa  from 'koa';
import  mongoose  from 'mongoose';
import { nanoid } from 'nanoid';
import { Url } from '../types/schemas/url';

const urlShortenerSchema = new mongoose.Schema<Url>(
    {
        shortCode: {
            type: String,
            default: () => nanoid(8),
            unique: true,
        },
        originalUrl: {
            type: String,
            required: [true, 'Original Url is required'],
        },
        visits: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

urlShortenerSchema.pre('save', function ():void {
    // get expire Date
    const expireDate = this.expiresAt;
    if (expireDate && expireDate <= new Date()) {
        throw new Error('expireAt must be a future date');
    }
});


urlShortenerSchema.methods.getShotUrl = function (ctx:koa.Context, doc:Url):string {
    // get protocol - host - shortCode
    const { host } = ctx.request.header;
    const { protocol } = ctx;
    const { shortCode } = doc;
    const fullUrl = `${protocol}://${host}/${shortCode}`;
    return fullUrl;
};
const UrlShortener = mongoose.model('UrlShortener', urlShortenerSchema);

export default UrlShortener;
