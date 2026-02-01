// app/dashboard/customer/components/dashboard-main.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CreditCard,
  User,
  Utensils,
  Coffee,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Step1CustomerInfo from "../steps/step1-customer-info";
import Step2FoodSelection from "../steps/step2-food-selection";
import Step3DrinkSelection from "../steps/step3-drink-selection";
import Step4SnackSelection from "../steps/step4-snack-selection";
import Step5Payment from "../steps/step5-payment";
import OrderSummary from "./order-summary";
import StepIndicator from "./step-indicator";

export interface CustomerInfo {
  id?: string;
  name: string;
  phone?: string;
  notes?: string;
}

export interface TableSelection {
  tableId: string;
  tableNumber: string;
  capacity: number;
}

export type OrderType = "dine-in" | "take-away";

export interface CartItem {
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
  notes?: string;
  category: string;
}

const STEPS = [
  { number: 1, title: "Customer Info", icon: User, slug: "customer-info" },
  { number: 2, title: "Select Food", icon: Utensils, slug: "select-food" },
  { number: 3, title: "Select Drinks", icon: Coffee, slug: "select-drinks" },
  {
    number: 4,
    title: "Select Snacks",
    icon: ShoppingBag,
    slug: "select-snacks",
  },
  { number: 5, title: "Payment", icon: CreditCard, slug: "payment" },
];

export default function DashboardMain() {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    id: "",
    name: "",
  });
  const [selectedTable, setSelectedTable] = useState<TableSelection | null>(
    null,
  );
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("qris");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.1;
  const serviceCharge = subtotal * 0.05;
  const totalAmount = subtotal + tax + serviceCharge;

  // --- Load Midtrans Snap Script ---
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    );
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getStepValidation = useCallback(
    (step: number) => {
      switch (step) {
        case 1:
          if (orderType === "dine-in") {
            return customerInfo.name && selectedTable;
          }
          return customerInfo.name;
        case 2:
        case 3:
        case 4:
          return true;
        case 5:
          return cart.length > 0;
        default:
          return false;
      }
    },
    [customerInfo.name, selectedTable, cart.length, orderType],
  );

  const goToNextStep = useCallback(() => {
    if (currentStep < 5 && getStepValidation(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  }, [currentStep, getStepValidation]);

  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    (step: number) => {
      if (step <= currentStep && !orderId) {
        setCurrentStep(step);
      }
    },
    [currentStep, orderId],
  );

  const handleUpdateCustomerInfo = useCallback(
    (info: CustomerInfo) => {
      setCustomerInfo({ ...info, id: info.id || customerInfo.id });
    },
    [customerInfo.id],
  );

  const handleSelectTable = useCallback((table: TableSelection) => {
    setSelectedTable(table);
  }, []);

  const handleOrderTypeChange = useCallback((type: OrderType) => {
    setOrderType(type);
    if (type === "take-away") {
      setSelectedTable(null);
    }
  }, []);

  const handleAddToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existingItem) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const handleUpdateQuantity = useCallback(
    (menuItemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        setCart((prev) =>
          prev.filter((item) => item.menuItemId !== menuItemId),
        );
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.menuItemId === menuItemId
              ? { ...item, quantity: newQuantity }
              : item,
          ),
        );
      }
    },
    [],
  );

  const handleRemoveItem = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  }, []);

  // --- FUNGSI UTAMA: Simpan Order ke Database (Backend) ---
  const finalizeOrder = useCallback(
    async (orderIdToFinalize: string, method: string = "qris") => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            orderType,
            tableId: selectedTable?.tableId,
            tableNumber: selectedTable?.tableNumber,
            items: cart,
            subtotal,
            tax,
            serviceCharge,
            discount: 0,
            totalAmount,
            paymentMethod: method, 
            paymentStatus: "paid",
            customerNotes: customerInfo.notes,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to finalize order");
        }

        setOrderId(orderIdToFinalize);
        setOrderNumber(data.orderNumber);
        setPaymentMethod(method);
      } catch (error) {
        console.error("Error finalizing order:", error);
        alert(
          "Order created but failed to save to database. Please contact staff.",
        );
      }
    },
    [
      customerInfo,
      orderType,
      selectedTable,
      cart,
      subtotal,
      tax,
      serviceCharge,
      totalAmount,
    ],
  );

  // --- PAYMENT via MIDTRANS ---
  const handlePlaceOrder = useCallback(async () => {
    if (orderType === "dine-in" && !selectedTable) {
      alert("Please select a table for dine-in order!");
      return;
    }

    if (!customerInfo.name || cart.length === 0) {
      alert("Please complete all required fields!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInfo,
          orderType,
          tableId: selectedTable?.tableId,
          items: cart,
          amount: totalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.snapToken) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      const currentOrderId = data.orderId;
      let paymentCompleted = false;

      // @ts-expect-error - Midtrans Snap global object
      window.snap.pay(data.snapToken, {
        onSuccess: function (result: any) {
          console.log("Payment success:", result);
          paymentCompleted = true;
          const method = result.payment_type ? result.payment_type : "qris";

          finalizeOrder(currentOrderId, method);
          setIsLoading(false);
        },

        onPending: function (result: any) {
          console.log("Payment pending:", result);
          paymentCompleted = true;
          const method = result.payment_type ? result.payment_type : "qris";

          finalizeOrder(currentOrderId, method);
          setIsLoading(false);
        },

        onError: function (result: any) {
          console.error("Payment error:", result);
          alert("Payment failed. Please try again.");
          setIsLoading(false);
        },

        onClose: function () {
          console.log("Payment popup closed");

          if (!paymentCompleted) {
            console.log("Auto-completing payment as qris (sandbox mode)");
            finalizeOrder(currentOrderId, "qris");
          }

          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again.";
      alert(errorMessage);
      setIsLoading(false);
    }
  }, [
    selectedTable,
    cart,
    customerInfo,
    totalAmount,
    orderType,
    finalizeOrder,
  ]);

  // --- NAVIGATION BUTTONS ---
  const renderNavigationButtons = () => {
    if (orderId) return null;

    return (
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={goToPrevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-1 p-2 bg-black hover:bg-gray-400 disabled:opacity-40 cursor-pointer text-white border border-gray-300 rounded-full transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs">
            Step {currentStep} of {STEPS.length}
          </span>

          {currentStep < 5 ? (
            <button
              onClick={goToNextStep}
              disabled={!getStepValidation(currentStep)}
              className="flex items-center gap-1 p-2 bg-black hover:bg-gray-400 disabled:opacity-40 cursor-pointer text-white border border-gray-300 rounded-full transition-colors text-sm font-medium"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || isLoading}
              className="flex items-center gap-1 p-3 bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors text-sm font-medium cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span className="ml-2">
                    Pay Rp {totalAmount.toLocaleString()}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <div className="mt-6">
        <div
          className={
            // PERUBAHAN 1: Step 1 (Info) dan Step 5 (Payment) menggunakan layout centered (Max Width)
            currentStep === 1 || currentStep === 5
              ? "max-w-4xl mx-auto" // Gunakan max-w-4xl agar layout 2 kolom di Step 1 lebih lega
              : "grid grid-cols-1 lg:grid-cols-12 gap-6"
          }
        >
          {/* PERUBAHAN 2: Lebar kolom full pada Step 1 & 5 */}
          <div className={currentStep === 1 || currentStep === 5 ? "w-full" : "lg:col-span-8"}>
            <div className={`min-h-screen`}>
              {currentStep === 1 && (
                <Step1CustomerInfo
                  customerInfo={customerInfo}
                  selectedTable={selectedTable}
                  orderType={orderType}
                  onUpdateCustomerInfo={handleUpdateCustomerInfo}
                  onSelectTable={handleSelectTable}
                  onOrderTypeChange={handleOrderTypeChange}
                />
              )}

              {currentStep === 2 && (
                <Step2FoodSelection
                  cart={cart.filter((item) => item.category === "food")}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              )}

              {currentStep === 3 && (
                <Step3DrinkSelection
                  cart={cart.filter((item) => item.category === "drink")}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              )}

              {currentStep === 4 && (
                <Step4SnackSelection
                  cart={cart.filter((item) => item.category === "snack")}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              )}

              {currentStep === 5 && (
                <Step5Payment
                  orderId={orderId}
                  orderNumber={orderNumber}
                  customerInfo={customerInfo}
                  selectedTable={selectedTable}
                  orderType={orderType}
                  cart={cart}
                  subtotal={subtotal}
                  tax={tax}
                  serviceCharge={serviceCharge}
                  totalAmount={totalAmount}
                  paymentMethod={paymentMethod}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              )}

              {renderNavigationButtons()}
            </div>
          </div>

          {currentStep !== 1 && currentStep !== 5 && (
            <div className={`lg:col-span-4`}>
              <div
                className={`sticky top-6 transition-opacity duration-200 opacity-100`}
              >
                <OrderSummary
                  cart={cart}
                  customerInfo={customerInfo}
                  selectedTable={selectedTable}
                  orderType={orderType}
                  subtotal={subtotal}
                  tax={tax}
                  serviceCharge={serviceCharge}
                  totalAmount={totalAmount}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}