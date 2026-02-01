/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Phone, 
  MessageSquare, 
  Table2, 
  Users, 
  ShoppingBag, 
  UtensilsCrossed, 
  CheckCircle2,
  MapPin,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
      } else {
        console.error("Failed to fetch tables");
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
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* --- LEFT COLUMN: CUSTOMER INFO --- */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-8 border-b border-black pb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <User className="w-5 h-6 text-black" />
            </div>
            <div>
              <h4 className="font-bold text-black text-base">Contact Details</h4>
              <p className="text-xs text-gray-500">Who is this order for?</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                <Input
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rojabby"
                  // Clean White Background with simple border
                  className="pl-11 h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Phone
              </Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                <Input
                  name="phone"
                  value={customerInfo.phone || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. 0812..."
                  className="pl-11 h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Notes
              </Label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                <Textarea
                  name="notes"
                  value={customerInfo.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Any allergies or special requests..."
                  className="pl-11 min-h-[120px] bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl resize-none transition-all font-medium text-black placeholder:text-gray-300 py-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: ORDER TYPE & TABLE --- */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-black pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-bold text-black text-base">Dining Preference</h3>
                <p className="text-xs text-gray-500">Where will you eat?</p>
              </div>
            </div>

            {/* Order Type Selector - High Contrast Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => onOrderTypeChange("dine-in")}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group",
                  orderType === "dine-in"
                    ? "bg-black border-black text-white shadow-lg scale-[1.02]"
                    : "bg-white border-gray-200 text-black hover:border-black hover:bg-gray-50" // gray-50 here is only for hover state interaction, barely visible
                )}
              >
                 {orderType === "dine-in" && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 fill-white text-black" />
                  </div>
                )}
                <UtensilsCrossed className={cn("w-6 h-6 transition-transform", orderType === "dine-in" ? "text-white" : "text-black group-hover:scale-110")} />
                <span className="font-bold text-sm">Dine In</span>
              </button>

              <button
                type="button"
                onClick={() => onOrderTypeChange("take-away")}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group",
                  orderType === "take-away"
                    ? "bg-black border-black text-white shadow-lg scale-[1.02]"
                    : "bg-white border-gray-200 text-black hover:border-black hover:bg-gray-50"
                )}
              >
                {orderType === "take-away" && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 fill-white text-black" />
                  </div>
                )}
                <ShoppingBag className={cn("w-6 h-6 transition-transform", orderType === "take-away" ? "text-white" : "text-black group-hover:scale-110")} />
                <span className="font-bold text-sm">Take Away</span>
              </button>
            </div>

            {/* Conditional Content */}
            <div className="transition-all duration-500 ease-in-out">
              {orderType === "take-away" ? (
                <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-bold text-black">
                    Ready for Pickup
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    No table reservation needed.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                    Select a Table
                  </Label>
                  
                  {loading ? (
                     <div className="h-14 w-full bg-gray-100 animate-pulse rounded-xl" />
                  ) : tables.length === 0 ? (
                    <div className="p-4 bg-white text-black text-sm font-medium rounded-xl border border-black flex items-center gap-2">
                       <span>⚠️</span> Full House! No tables available.
                    </div>
                  ) : (
                    <>
                      <Select
                        onValueChange={handleSelectChange}
                        value={selectedTable?.tableId || undefined}
                      >
                        <SelectTrigger className="h-14 bg-white border border-gray-300 rounded-xl font-medium text-black px-4 cursor-pointer transition-all">
                          <SelectValue placeholder="Choose your spot..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white rounded-xl shadow-xl">
                          {tables.map((t) => (
                            <SelectItem key={t.tableId} value={t.tableId} className="cursor-pointer py-3">
                              <span className="font-semibold">Table {t.tableNumber}</span>
                              <span className="text-xs ml-2 opacity-70">({t.capacity} Seats)</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedTable && (
                        <div className="mt-4 flex items-center gap-4 p-4  transition-all ">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
                            <Table2 className="w-6 h-6 text-black" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black">
                              Table {selectedTable.tableNumber}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Users className="w-3.5 h-3.5 text-gray-400" /> 
                              <span className="text-xs font-medium text-gray-500">{selectedTable.capacity} Seats Available</span>
                            </div>
                          </div>
                          <div className="ml-auto">
                            <CheckCircle2 className="w-6 h-6 text-black" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}