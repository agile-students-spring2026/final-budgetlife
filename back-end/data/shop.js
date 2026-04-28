const UserCurrency = require("../models/userCurrency");

const shopItemsPrice = {
    houseUpgrade: 200,
    park: 150,
    hospital: 500,
    school: 300,
};

async function getUserCurrency(userId) {
    const doc = await UserCurrency.findOne({ user: userId });
    return doc ? doc.currency : null;
}

function getShopItemsPrice() {
    return shopItemsPrice;
}

async function updateUserCurrency(userId, amount) {
    const doc = await UserCurrency.findOne({ user: userId });
    if (!doc) return false;
    doc.currency = amount;
    await doc.save();
    return true;
}

async function addUserCurrency(userId, amount) {
    await UserCurrency.findOneAndUpdate(
        { user: userId },
        { $inc: { currency: amount } },
        { upsert: true, new: true }
    );
}

async function purchaseItem(userId, item) {
    const itemPrice = shopItemsPrice[item];
    if (itemPrice === undefined) {
        return { success: false, message: "Item not found" };
    }
    const doc = await UserCurrency.findOne({ user: userId });
    if (!doc) {
        return { success: false, message: "Insufficient funds" };
    }
    if (doc.currency < itemPrice) {
        return { success: false, message: "Insufficient funds" };
    }
    doc.currency -= itemPrice;
    await doc.save();
    return { success: true, message: "Purchase successful" };
}

module.exports = { addUserCurrency, getShopItemsPrice, getUserCurrency, purchaseItem, updateUserCurrency };
