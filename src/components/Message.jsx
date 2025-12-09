import React from 'react';

const Message = ({ variant = 'info', children }) => {
    let bgColor = 'bg-blue-100';
    let textColor = 'text-blue-900';

    if (variant === 'danger') {
        bgColor = 'bg-red-100';
        textColor = 'text-red-900';
    } else if (variant === 'success') {
        bgColor = 'bg-green-100';
        textColor = 'text-green-900';
    }

    return (
        <div className={`p-4 mb-4 rounded ${bgColor} ${textColor}`}>
            {children}
        </div>
    );
};

export default Message;
