import {
    Chart as ChartJS,
    registerables
} from 'chart.js';

// Idempotent registration
let isRegistered = false;

export const registerCharts = () => {
    if (isRegistered) return;

    ChartJS.register(...registerables);

    isRegistered = true;
    console.log('ChartJS components registered successfully');
};
