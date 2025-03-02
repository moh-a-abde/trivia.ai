export const saveScore = async (username: string, score: number, sport: 'basketball' | 'soccer' = 'basketball') => {
    try {
        // Make sure username is not empty
        if (!username || username.trim() === '') {
            console.error('Cannot save score: Username is required');
            return;
        }
        
        // Add a "Guest-" prefix to guest usernames if they don't already have it
        const formattedUsername = username.startsWith('Guest-') ? username : username;
        
        const response = await fetch('/api/saveScore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: formattedUsername, score, sport }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to save score: ${response.status} - ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error saving score:', error);
    }
};
