import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// 티켓 스키마 정의
const ticketSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    }, // 특정 store와 연관된 티켓 정보
    price: { type: Number, required: true },
  },
  schemaOptions
);

const TicketModel = mongoose.model('Ticket', ticketSchema);

export default TicketModel;
