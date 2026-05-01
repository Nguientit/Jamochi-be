const { SpecialDate } = require('../models'); 

// 1. Lấy danh sách
const getDatesByCouple = async (coupleId) => {
  try {
    if (!coupleId) throw new Error('coupleId is missing');

    const dates = await SpecialDate.findAll({
      where: { couple_id: coupleId },
      order: [['target_date', 'ASC']]
    });
    return dates;
  } catch (error) {
    console.error('🔴 Lỗi tại getDatesByCouple:', error.message);
    throw error;
  }
};

// 2. Thêm mới
const createDate = async (coupleId, userId, title, date) => {
  return await SpecialDate.create({
    couple_id: coupleId,
    created_by: userId,
    title: title,
    target_date: date,
    type: 'anniversary'
  });
};

// 3. Cập nhật
const updateDate = async (coupleId, dateId, title, date) => {
  const specialDate = await SpecialDate.findOne({
    where: { id: dateId, couple_id: coupleId }
  });

  if (!specialDate) {
    throw new Error('Không tìm thấy ngày kỷ niệm');
  }

  return await specialDate.update({ 
    title: title, 
    target_date: date
  });
};

// 4. Xóa
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