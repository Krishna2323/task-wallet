import FilterOptions from "@/components/common/filters/FilterOptions";
import { useAuthStore } from "@/utils/zustand/authStore/useAuthStore";
import {
  getWalletData,
  useDashboardStore,
} from "@/utils/zustand/dashboardStore/useDashboardStore";
import { useRealmStore } from "@/utils/zustand/realm/useRealmStore";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const WalletAnalytics = () => {
  const { walletData } = useDashboardStore((s) => s);

  const [daysFilter, setDaysFilter] = useState("30 Days");

  const { user } = useAuthStore((s) => s);

  const { currentRealm } = useRealmStore((s) => s);

  const dashboardStore = useDashboardStore();

  useEffect(() => {
    if (user && currentRealm) {
      getWalletData({
        dashboardStore,
        page: 1,
        realm: currentRealm.name,
        userId: user.$id,
        filters: {
          days: daysFilter ? parseInt(daysFilter.match(/\d+/)![0]) || 7 : 7,
        },
      });
    }
  }, [user, currentRealm, daysFilter]);

  const [chartWidth, setChartWidth] = useState(window.innerWidth * 0.7); // Set an initial width for the chart
  const [chartHeight, setChartHeight] = useState(window.innerWidth * 0.4);
  useEffect(() => {
    const handleResize = () => {
      setChartWidth(window.innerWidth * 0.7); // Adjust the width based on the container's size
      setChartHeight(window.innerHeight * 0.4);
    };

    if (window) {
      window.addEventListener("resize", handleResize); // Listen for window resize events
      return () => {
        window.removeEventListener("resize", handleResize); // Clean up the event listener
      };
    }
  }, []);
  return (
    <>
      <div className="p-3 rounded-2xl shadow-shadow-form-input w-fit mx-auto">
        <div className="flex mb-8 ml-14 justify-between">
          <h2 className="text-xl font-semibold">Wallet</h2>
          <FilterOptions
            label="ALL"
            multiple={false}
            onBlur={() => {}}
            onChange={(val) => {
              setDaysFilter(val);
            }}
            onFocus={() => {}}
            options={[
              { name: "7 Days" },
              { name: "30 Days" },
              { name: "90 Days" },
            ]}
            value={daysFilter}
          />
        </div>
        <div className="flex">
          {walletData && (
            <div className="flex flex-col">
              <h2 className="ml-14 mb-4">Credited</h2>
              <AreaChart
                data={walletData || []}
                className="w-full h-full mb-10"
                // className="bg-red-100"
                width={chartWidth}
                height={chartHeight}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip wrapperStyle={{ background: "red" }} />
                <XAxis
                  dataKey={"date" || "from"}
                  className="!text-sm"
                  fontSize={12}
                  color="#fff"
                  tick={{
                    fill: "#fff",
                  }}
                />
                <YAxis
                  fontSize={12}
                  tick={{
                    fill: "#fff",
                  }}
                />
                <Area
                  dataKey={"credited"}
                  type={"monotone"}
                  stroke={"#8ce99a"}
                  fill="#2b8a3e"
                  strokeWidth={1}
                  color="#fff"
                  opacity={100}
                />
              </AreaChart>
              <h2 className="ml-14 mb-4">Debited</h2>
              <AreaChart
                data={walletData || []}
                className="w-full h-full"
                // className="bg-red-100"
                width={chartWidth}
                height={chartHeight}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip wrapperStyle={{ background: "red" }} />
                <XAxis
                  dataKey={"date" || "from"}
                  className="!text-sm"
                  fontSize={12}
                  color="#fff"
                  tick={{
                    fill: "#fff",
                  }}
                />
                <YAxis
                  fontSize={12}
                  tick={{
                    fill: "#fff",
                  }}
                />
                <Area
                  dataKey={"debited"}
                  type={"monotone"}
                  stroke={"#ff8787"}
                  fill="#f03e3e"
                  strokeWidth={1}
                  color="#fff"
                />
              </AreaChart>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletAnalytics;
