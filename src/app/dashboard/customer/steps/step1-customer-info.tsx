/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/customer/steps/step1-customer-info.tsx
"use client";

import { useEffect, useState } from "react";
import { User, Phone, MessageSquare, Table2, Users, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { fluidSize } from "@/lib/utils";

interface CustomerInfo {
  name: string;
  phone?: string;
  notes?: string;
}

interface TableSelection {
  tableId: string;
  tableNumber: string;
  capacity: number;
}

type OrderType = "dine-in" | "take-away";

export interface Step1CustomerInfoProps {
  customerInfo: CustomerInfo;
  selectedTable: TableSelection | null;
  orderType: OrderType;
  onUpdateCustomerInfo: (info: CustomerInfo) => void;
  onSelectTable: (table: TableSelection) => void;
  onOrderTypeChange: (type: OrderType) => void;
}

export default function Step1CustomerInfo({
  customerInfo,
  selectedTable,
  orderType,
  onUpdateCustomerInfo,
  onSelectTable,
  onOrderTypeChange,
}: Step1CustomerInfoProps) {
  const [tables, setTables] = useState<TableSelection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderType === "dine-in") {
      fetchAvailableTables();
    } else {
      setLoading(false);
    }
  }, [orderType]);

  const fetchAvailableTables = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tables?status=available");
      if (res.ok) {
        const data = await res.json();
        setTables(
          data.map((table: any) => ({
            tableId: table._id,
            tableNumber: table.tableNumber,
            capacity: table.capacity,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching tables", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onUpdateCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    const table = tables.find((t) => t.tableId === value);
    if (table) onSelectTable(table);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Customer Info Form */}
        <div className="space-y-6">
          {/* Customer Info Form */}
          <div className="bg-white rounded-lg px-6 space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 !text-sm font-medium">
                Full Name 
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="pl-10 py-5 bg-white border-gray-50 rounded-md text-black placeholder-gray-500 focus:border-gray-200 focus:ring-gray-200
                           [&:-webkit-autofill]:!bg-white
                           [&:-webkit-autofill]:![box-shadow:0_0_0_1000px_white_inset]
                           [&:-webkit-autofill]:![-webkit-text-fill-color:#000000]
                           [&:-webkit-autofill]:!border-gray-50"
                />
              </div>
              {!customerInfo.name && (
                <p className="!text-xs text-red-500">Full name is required</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 !text-sm font-medium">
                Phone Number <span className="text-gray-500 text-xs">( Optional )</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  name="phone"
                  value={customerInfo.phone || ""}
                  onChange={handleInputChange}
                  placeholder="+62 812-3456-7890"
                  className="pl-10 py-5 bg-white border-gray-50 rounded-md text-black placeholder-gray-500 focus:border-gray-200 focus:ring-gray-200
                           [&:-webkit-autofill]:!bg-white
                           [&:-webkit-autofill]:![box-shadow:0_0_0_1000px_white_inset]
                           [&:-webkit-autofill]:![-webkit-text-fill-color:#000000]
                           [&:-webkit-autofill]:!border-gray-50"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 !text-sm font-medium">
                Special Notes <span className="text-gray-500 text-xs">( Optional )</span>
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Textarea
                  name="notes"
                  rows={4}
                  value={customerInfo.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Any dietary requirements, allergies, or special requests..."
                  className="pl-10 bg-white border-gray-50 rounded-md text-black placeholder-gray-500 focus:border-gray-200 focus:ring-gray-200
                           [&:-webkit-autofill]:!bg-white
                           [&:-webkit-autofill]:![box-shadow:0_0_0_1000px_white_inset]
                           [&:-webkit-autofill]:![-webkit-text-fill-color:#000000]
                           [&:-webkit-autofill]:!border-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Type Selector + Table Selection */}
        <div className="space-y-6">
          {/* Order Type Selector */}
          <div className="bg-white rounded-lg px-6">
            <Label className="text-gray-700 !text-sm font-medium mb-4 block">
              Order Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Dine In Option */}
              <button
                type="button"
                onClick={() => onOrderTypeChange("dine-in")}
                className={`relative rounded-lg transition-all duration-200 cursor-pointer ${
                  orderType === "dine-in"
                    ? "bg-gray-900 text-white border border-gray-900"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center px-4">
                  <div 
                    className={`flex items-center justify-center rounded-md `}
                    style={{
                      width: fluidSize(40),
                      height: fluidSize(40)
                    }}
                  >
                    <UtensilsCrossed 
                      className={`${orderType === "dine-in" ? "text-white" : "text-gray-600"}`}
                      style={{
                        width: fluidSize(20),
                        height: fluidSize(20)
                      }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className={`font-bold !text-sm ${
                      orderType === "dine-in" ? "text-white" : "text-gray-900"
                    }`}>
                      Dine In
                    </p>
                  </div>
                </div>
                
                {orderType === "dine-in" && (
                  <div 
                    className="absolute -top-2 -right-2 bg-white border-2 border-gray-900 text-gray-900 rounded-full flex items-center justify-center"
                    style={{
                      width: fluidSize(20),
                      height: fluidSize(20)
                    }}
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Take Away Option */}
              <button
                type="button"
                onClick={() => onOrderTypeChange("take-away")}
                className={`relative rounded-lg transition-all duration-200 cursor-pointer ${
                  orderType === "take-away"
                    ? "bg-gray-900 text-white border-2 border-gray-900"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center px-4">
                  <div 
                    className={`flex items-center justify-center rounded-md`}
                    style={{
                      width: fluidSize(40),
                      height: fluidSize(40)
                    }}
                  >
                    <ShoppingBag 
                      className={`${orderType === "take-away" ? "text-white" : "text-gray-600"}`}
                      style={{
                        width: fluidSize(20),
                        height: fluidSize(20)
                      }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className={`font-bold !text-sm ${
                      orderType === "take-away" ? "text-white" : "text-gray-900"
                    }`}>
                      Take Away
                    </p>
                  </div>
                </div>
                
                {orderType === "take-away" && (
                  <div 
                    className="absolute -top-2 -right-2 bg-white border-2 border-gray-900 text-gray-900 rounded-full flex items-center justify-center"
                    style={{
                      width: fluidSize(20),
                      height: fluidSize(20)
                    }}
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Table Selection (Only for Dine-In) */}
          <div className="bg-white px-6 space-y-5">
            {orderType === "take-away" ? (
              // Take Away Info
              <div className="flex flex-col items-center justify-center py-7 space-y-4">
                <div 
                  className="bg-gray-100 rounded-full flex items-center justify-center w-10 h-10"
                >
                  <ShoppingBag className="text-gray-700 w-5 h-5"/>
                </div>
                <div className="text-center">
                  <p className="text-gray-900 font-bold !text-sm mb-2">Take Away Order</p>
                  <p className="text-gray-600 !text-sm max-w-xs">
                    Your order will be prepared for pickup. No table reservation required.
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-md w-full">
                  <p className="text-gray-700 !text-xs text-center">
                    ✓ Ready for pickup after payment
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                <p className="!text-sm text-gray-500">Loading available tables...</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="bg-gray-50 border border-gray-300 p-6 text-center rounded-md">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Table2 className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-900 font-semibold mb-2">No Tables Available</p>
                <p className="!text-sm text-gray-600">
                  All tables are currently occupied. Please wait or choose take away option.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 !text-sm font-medium mb-6">
                    Select a Table
                  </Label>
                  <Select
                    onValueChange={handleSelectChange}
                    value={selectedTable?.tableId || undefined}
                  >
                    <SelectTrigger 
                      className="w-full bg-white border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-gray-900"
                    >
                      <SelectValue placeholder="Choose an available table" />
                    </SelectTrigger>

                    <SelectContent 
                      className="bg-white border-gray-200"
                    >
                      {tables.map((t) => (
                        <SelectItem 
                          key={t.tableId} 
                          value={t.tableId}
                          className="text-gray-900 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">Table {t.tableNumber}</span>
                            <span className="text-gray-500 text-sm ml-4 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {t.capacity} seats
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Table Info */}
                {selectedTable && (
                  <div className=" p-4 rounded-md">
                    <div className="flex items-center gap-3">
                      <div 
                        className=" flex items-center justify-center rounded-md w-7 h-7"
                      >
                        <Table2 className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold !text-sm">Table {selectedTable.tableNumber} Selected</p>
                        <p className="text-gray-600 !text-sm flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Capacity: {selectedTable.capacity} people
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}