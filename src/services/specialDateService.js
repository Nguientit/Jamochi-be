// services/specialDateService.js
const { SpecialDate } = require('../models');

// 1. Lấy danh sách ngày
const getDatesByCouple = async (coupleId) => {
  return await SpecialDate.findAll({
    where: { couple_id: coupleId },
    order: [['target_date', 'ASC']]
  });
};
// 2. Thêm ngày mới
const createDate = async (coupleId, userId, title, date) => {
  return await SpecialDate.create({
    couple_id: coupleId,
    created_by: userId,
    title: title,
    target_date: date,
    type: 'anniversary'
  });
};

// 3. Sửa ngày
const updateDate = async (coupleId, dateId, title, date) => {
  const specialDate = await SpecialDate.findOne({
    where: { id: dateId, couple_id: coupleId }
  });

  if (!specialDate) throw new Error('Không tìm thấy ngày kỷ niệm');

  return await specialDate.update({ 
    title: title, 
    target_date: date
  });
};

// 4. Xóa ngày
const deleteDate = async (coupleId, dateId) => {
  const specialDate = await SpecialDate.findOne({
    where: { id: dateId, couple_id: coupleId }
  });

  if (!specialDate) {
    throw new Error('Không tìm thấy ngày kỷ niệm');
  }

  await specialDate.destroy();
  return true;
};

module.exports = {
  getDatesByCouple,
  createDate,
  updateDate,
  deleteDate
};