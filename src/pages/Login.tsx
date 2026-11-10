export default function Login() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                <div className="flex justify-center mb-10">
                    <img src="/Thrive.png" alt="Thrive" className="h-16 w-auto object-contain" />
                </div>

                <p className="text-[#31C2F4] text-xs uppercase tracking-[0.3em] font-medium mb-4">Team Portal</p>
                <h1 className="font-display text-3xl font-black text-white mb-6">System Closed</h1>

                <p className="text-white/60 text-base leading-relaxed mb-4">
                    As we wrap up this chapter of Thrive, we want to thank you for being part of our journey and for believing in our mission of Wellness That Works.
                </p>
                <p className="text-white/50 text-base leading-relaxed mb-4">
                    Your support, energy, and engagement made this experience truly unforgettable. From day one, you helped bring Thrive to life and made everything we created more meaningful.
                </p>
                <p className="text-white/60 text-base leading-relaxed">
                    We are so grateful to have shared this with you. Thank you for being part of Thrive this year. 🌊
                </p>

                <div className="mt-10 flex items-center justify-center gap-3">
                    <div className="h-px w-12 bg-white/20" />
                    <span className="text-white/30 text-sm font-medium tracking-widest uppercase">THRIVE Wellness</span>
                    <div className="h-px w-12 bg-white/20" />
                </div>
            </div>
        </div>
    );
}
