"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("wc_token");
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await api.auth.me();
                if (res.success && res.user) {
                    setUser(res.user);
                } else {
                    // Token might be invalid or expired
                    localStorage.removeItem("wc_token");
                    setUser(null);
                }
            } catch (err) {
                console.error("Failed to fetch user context", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = () => {
        api.auth.logout();
        setUser(null);
        router.push("/login");
    };

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
