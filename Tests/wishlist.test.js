const {test}=require("node:test");
const assert=require("node:assert/strict");
const Customer=require("../Models/customer.model.js");
const {getWishlist}=require("../Controllers/wishlist.controllers.js");

const response=()=>({statusCode:200,status(code){this.statusCode=code;return this;},json(data){this.data=data;return this;}});

test("wishlist response includes category required by the product cards",async()=>{
 const original=Customer.findById;
 const product={_id:"product-id",name:"Keyboard",description:"Sample",category:"Electronics",image:"/products/keyboard-desk-photo.jpg",price:2999,stock:10};
 try{
  Customer.findById=(id)=>{assert.equal(id,"customer-id");return{populate:async(options)=>{const selected={_id:product._id};for(const field of options.select.split(" "))selected[field]=product[field];return{wishlist:[selected]};}};};
  const res=response();await getWishlist({user:{id:"customer-id"}},res);
  assert.equal(res.statusCode,200);assert.equal(res.data.message[0].category,"Electronics");assert.equal(res.data.message[0].price,2999);
 }finally{Customer.findById=original;}
});

test("wishlist request failures return JSON errors rather than successful product data",async()=>{
 const original=Customer.findById;
 try{Customer.findById=()=>({populate:async()=>{throw new Error("Offline")}});const res=response();await getWishlist({user:{id:"customer-id"}},res);assert.equal(res.statusCode,500);assert.equal(res.data.success,false);}finally{Customer.findById=original;}
});
