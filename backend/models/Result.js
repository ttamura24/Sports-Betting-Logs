import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  result: {
    type: String,
    required: [true, 'Result name is required'],
  },
});

const Result = mongoose.model('result', resultSchema);

export default Result; 