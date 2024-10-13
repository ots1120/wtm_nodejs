import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const ticketHistoryPurchaseSchema = new mongoose.Schema(
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

    amount: {
      type: Number,
      required: true,
    },
  },
  schemaOptions
);

const TicketHistoryPurchaseModel = mongoose.model(
  'TicketHistoryPurchase',
  ticketHistoryPurchaseSchema,
  'TicketHistoryPurchase'
);

export default TicketHistoryPurchaseModel;
