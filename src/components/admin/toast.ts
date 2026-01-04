import Swal from 'sweetalert2';

export function toastSuccess(message: string) {
    return Swal.fire({
        toast: true,
        position: 'top',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
            popup: 'rounded-md shadow-md bg-emerald-600 text-white border border-emerald-700',
            title: 'text-sm font-semibold',
        },
    });
}
