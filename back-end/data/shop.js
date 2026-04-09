const userCurrency = {
    alexr:        { currency: 0 },
    jordy88:      { currency: 0 },
    caseybuilds:  { currency: 0 },
    taylortracks: { currency: 0 },
    morgmoney:    { currency: 0 },
    rileybudgets: { currency: 0 },
    jamiecity:    { currency: 0 },
    averyplays:   { currency: 0 },
    parkerplans:  { currency: 0 },
    skylerstacks: { currency: 0 },
}

const shopItemsPrice = {
    houseUpgrade: 200,
    park: 150,
    hospital: 500,
    school: 300
}

let userCurrencyCopy = JSON.parse(JSON.stringify(userCurrency));
let shopItemsPriceCopy = JSON.parse(JSON.stringify(shopItemsPrice));

function getUserCurrency(username) {
    return userCurrencyCopy[username] ? userCurrencyCopy[username].currency : null;
}

function getShopItemsPrice() {
    return shopItemsPriceCopy;
}

function updateUserCurrency(username, amount) {
    if (userCurrencyCopy[username]) {
        userCurrencyCopy[username].currency = amount;
    }
}

function addUserCurrency(username, amount) {
    if (userCurrencyCopy[username]) {
        userCurrencyCopy[username].currency += amount;
    }
}

function purchaseItem(username, item) {
    const itemPrice = shopItemsPriceCopy[item];
    if (itemPrice === undefined) {
        return { success: false, message: 'Item not found' };
    }
    if (userCurrencyCopy[username].currency >= itemPrice) {
        userCurrencyCopy[username].currency -= itemPrice;
        return { success: true, message: 'Purchase successful' };
    } else {
        return { success: false, message: 'Insufficient funds' };
    }
}

module.exports = { addUserCurrency, getShopItemsPrice, getUserCurrency, purchaseItem, updateUserCurrency };

