document.addEventListener('DOMContentLoaded', () => {
    const inputLine = document.getElementById('input-line');
    const commandInput = document.getElementById('command-input');
    const terminal = document.getElementById('terminal');

    // Handle mobile keyboard
    function handleMobileKeyboard() {
        // Check if it's a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Adjust input position when keyboard appears
            commandInput.addEventListener('focus', () => {
                // Slightly delay to ensure keyboard is up
                setTimeout(() => {
                    // Adjust terminal scroll to bottom
                    terminal.scrollTop = terminal.scrollHeight;
                    
                    // On some mobile browsers, we might need to adjust viewport
                    window.scrollTo(0, 0);
                }, 100);
            });

            // Optional: Scroll back to normal when input loses focus
            commandInput.addEventListener('blur', () => {
                window.scrollTo(0, 0);
            });
        }
    }

    // Ensure responsive design works on resize
    function adjustLayout() {
        const viewportHeight = window.innerHeight;
        document.body.style.height = `${viewportHeight}px`;
    }

    // Initial setup
    handleMobileKeyboard();
    adjustLayout();

    // Reapply on resize
    window.addEventListener('resize', adjustLayout);
});