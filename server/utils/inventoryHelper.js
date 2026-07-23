/**
 * Inventory deduction helper.
 *
 * Given an order's items, decrements the relevant stock rows:
 *  - Predefined pizzas deduct 1 base, 1 sauce, 1 cheese per pizza
 *    (we count them against the generic category stock).
 *  - Custom pizzas deduct their specific base/sauce/cheese by name, plus
 *    each vegetable by count × quantity.
 *
 * Emits an 'inventoryUpdate' Socket.IO event so the admin dashboard refreshes.
 */
const Inventory = require('../models/Inventory');

/**
 * Decrement stock for a single order. Idempotent — checks order.inventoryDeducted.
 * @param {import('mongoose').Document} order
 * @param {import('socket.io').Server} io
 */
async function deductInventoryForOrder(order, io) {
  if (order.inventoryDeducted) return;

  for (const item of order.items) {
    const qty = item.quantity || 1;

    if (item.custom) {
      // Custom pizza: deduct named ingredients when a matching row exists.
      await decrementByCategoryAndName('base', item.custom.base, qty);
      await decrementByCategoryAndName('sauce', item.custom.sauce, qty);
      await decrementByCategoryAndName('cheese', item.custom.cheese, qty);
      for (const veg of item.custom.vegetables || []) {
        await decrementByCategoryAndName('vegetable', veg, qty);
      }
    } else {
      // Predefined pizza: decrement one of each core category per pizza.
      await decrementGenericCategory('base', qty);
      await decrementGenericCategory('sauce', qty);
      await decrementGenericCategory('cheese', qty);
    }
  }

  order.inventoryDeducted = true;
  await order.save();

  if (io) {
    const all = await Inventory.find().lean();
    io.emit('inventoryUpdate', all);
  }
}

async function decrementGenericCategory(category, amount) {
  // Decrement the first row of the category that still has stock.
  const row = await Inventory.findOne({ category, quantity: { $gt: 0 } });
  if (!row) return;
  row.quantity = Math.max(0, row.quantity - amount);
  await row.save();
}

async function decrementByCategoryAndName(category, name, amount) {
  const row = await Inventory.findOne({ category, name: { $regex: `^${name}$`, $options: 'i' } });
  if (!row) return;
  row.quantity = Math.max(0, row.quantity - amount);
  await row.save();
}

module.exports = { deductInventoryForOrder };
