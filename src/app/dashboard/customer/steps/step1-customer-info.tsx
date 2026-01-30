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
  CheckCircle2 
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

  // Effect untuk memanggil data meja saat mode Dine-In dipilih
  useEffect(() => {
    if (orderType === "dine-in") {
      fetchAvailableTables();
    } else {
      setLoading(false);
    }
  }, [orderType]);

  // --- LOGIKA FETCH ASLI ---
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
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* --- LEFT COLUMN: CUSTOMER INFO --- */}
        <div className="space-y-6">
          <div className="space-y-5">
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-800 dark:group-focus-within:text-slate-200 transition-colors" />
                <Input
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rojabby"
                  // CHANGE: bg-white -> bg-background agar autofill css bekerja
                  className="pl-10 h-11 bg-background border-slate-200 focus:border-slate-800 focus:ring-slate-800 rounded-lg transition-all dark:border-slate-700 dark:focus:border-slate-400"
                />
              </div>
              {!customerInfo.name && (
                <p className="text-[11px] text-red-500 font-medium ml-1">
                  * Name is required
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</Label>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Optional</span>
              </div>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-800 dark:group-focus-within:text-slate-200 transition-colors" />
                <Input
                  name="phone"
                  value={customerInfo.phone || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. 0812..."
                  // CHANGE: bg-white -> bg-background
                  className="pl-10 h-11 bg-background border-slate-200 focus:border-slate-800 focus:ring-slate-800 rounded-lg transition-all dark:border-slate-700 dark:focus:border-slate-400"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Special Notes</Label>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Optional</span>
              </div>
              <div className="relative group">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-slate-800 dark:group-focus-within:text-slate-200 transition-colors" />
                <Textarea
                  name="notes"
                  value={customerInfo.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Allergies, extra spicy, etc..."
                  // CHANGE: bg-white -> bg-background
                  className="pl-10 min-h-[100px] bg-background border-slate-200 focus:border-slate-800 focus:ring-slate-800 rounded-lg resize-none transition-all dark:border-slate-700 dark:focus:border-slate-400"
                />
              </div>
            </div>

          </div>
        </div>

        {/* --- RIGHT COLUMN: ORDER TYPE & TABLE --- */}
        <div className="space-y-8">
          
          {/* Order Type Selector */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 ">Order Type</Label>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Dine In Button */}
              <button
                type="button"
                onClick={() => onOrderTypeChange("dine-in")}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ease-in-out text-left group cursor-pointer",
                  orderType === "dine-in"
                    ? "bg-slate-950 border-slate-950 text-white shadow-md ring-2 ring-slate-200 ring-offset-2 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100 dark:ring-slate-700"
                    : "bg-background border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  orderType === "dine-in" ? " text-white dark:text-slate-950" : " text-slate-500"
                )}>
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Dine In</span>
                </div>
                
                {/* Active Checkmark Badge */}
                {orderType === "dine-in" && (
                  <div className="absolute -top-2 -right-2 bg-white text-slate-950 rounded-full p-0.5 ">
                    <CheckCircle2 className="w-5 h-5 fill-slate-950 text-white dark:fill-white dark:text-slate-950" />
                  </div>
                )}
              </button>

              {/* Take Away Button */}
              <button
                type="button"
                onClick={() => onOrderTypeChange("take-away")}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ease-in-out text-left group cursor-pointer",
                  orderType === "take-away"
                    ? "bg-slate-950 border-slate-950 text-white shadow-md ring-2 ring-slate-200 ring-offset-2 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100 dark:ring-slate-700"
                    : "bg-background border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  orderType === "take-away" ? " text-white dark:text-slate-950" : " text-slate-500"
                )}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Take Away</span>
                </div>

                {/* Active Checkmark Badge */}
                {orderType === "take-away" && (
                  <div className="absolute -top-2 -right-2 bg-white text-slate-950 rounded-full p-0.5 ">
                    <CheckCircle2 className="w-5 h-5 fill-slate-950 text-white dark:fill-white dark:text-slate-950" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Conditional Rendering based on Order Type */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {orderType === "take-away" ? (
              // TAKE AWAY VIEW
              <div className="rounded-xl p-6 flex flex-col items-center text-center space-y-3 ">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                   <ShoppingBag className="w-6 h-6 text-slate-900 dark:text-slate-200" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-200">Take Away</h4>
                  <p className="text-sm text-slate-500 max-w-[250px] mx-auto mt-1 dark:text-slate-400">
                    Order will be prepared for pickup. No table reservation needed.
                  </p>
                </div>
              </div>
            ) : (
              // DINE IN VIEW (Table Selection with Real Data)
              <div className="space-y-4">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Table</Label>
                
                {loading ? (
                   <div className="h-12 w-full bg-slate-50 animate-pulse rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700" />
                ) : tables.length === 0 ? (
                  <div className="p-4 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900">
                    Full House! No tables available right now.
                  </div>
                ) : (
                  <>
                    <Select
                      onValueChange={handleSelectChange}
                      value={selectedTable?.tableId || undefined}
                    >
                      <SelectTrigger className="h-12 bg-background border-slate-200 focus:ring-slate-800 rounded-lg dark:border-slate-700 dark:focus:ring-slate-400 cursor-pointer">
                        <SelectValue placeholder="Choose a table..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((t) => (
                          <SelectItem key={t.tableId} value={t.tableId}>
                            <div className="flex items-center gap-2 cursor-pointer">
                              <span>Table {t.tableNumber}</span>
                              <span className="text-slate-400 text-xs">({t.capacity} Seats)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Selected Table Summary Card */}
                    {selectedTable && (
                      <div className="mt-4 flex items-center gap-4 p-4 bg-white  rounded-xl  ">
                        <div className="w-10 h-10  text-black rounded-lg flex items-center justify-center shrink-0">
                          <Table2 className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                            Table {selectedTable.tableNumber} Selected
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-500 flex items-center gap-1 dark:text-slate-400">
                              <Users className="w-3 h-3" /> {selectedTable.capacity} People
                            </span>
                          </div>
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
  );
}