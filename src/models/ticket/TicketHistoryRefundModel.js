import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const ticketHistoryRefundSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  schemaOptions
);

const TicketHistoryRefund = mongoose.model(
  'TicketHistoryRefund',
  ticketHistoryRefundSchema
);

export default TicketHistoryRefund;
