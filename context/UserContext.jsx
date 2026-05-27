"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = React.useCallback(async () => {
        const token = localStorage.getItem("wc_token");
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const res = await api.auth.me();
            if (res.success && res.user) {
                setUser(res.user);
            } else {
                localStorage.removeItem("wc_token");
                setUser(null);
            }
        } catch (err) {
            console.error("Failed to fetch user context", err);
            localStorage.removeItem("wc_token");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email, password) => {
        const result = await api.auth.login(email, password);
        if (result.success && result.user.access_token) {
            localStorage.setItem("wc_token", result.user.access_token);
            await fetchUser();
            return { success: true };
        }
        return result;
    };

    const signup = async (name, email, password) => {
        const result = await api.auth.signup(name, email, password);
        if (result.success && result.user.access_token) {
            localStorage.setItem("wc_token", result.user.access_token);
            await fetchUser();
            return { success: true };
        }
        return result;
    };

    const logout = () => {
        api.auth.logout();
        setUser(null);
        router.push("/login");
    };

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, login, signup, logout, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
