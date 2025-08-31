-- CreateTable
CREATE TABLE "MarketListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_item_id" INTEGER,
    "quantity" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketListing_user_item_id_fkey" FOREIGN KEY ("user_item_id") REFERENCES "UserItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buyer_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketRequest_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketRequest_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buyer_id" INTEGER,
    "seller_id" INTEGER,
    "item_id" INTEGER,
    "price" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketListing_user_item_id_key" ON "MarketListing"("user_item_id");
