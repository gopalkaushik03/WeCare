export default function Footer() {
    return (
        <footer className="w-full py-6 mt-12 border-t border-border/40 bg-white/30 backdrop-blur-sm">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} WECARE Platform.</p>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        System Normal
                    </span>
                </div>
                <p className="mt-2 md:mt-0 text-xs text-muted-foreground/60">
                    This platform does not replace professional help.
                </p>
            </div>
        </footer>
    );
}
