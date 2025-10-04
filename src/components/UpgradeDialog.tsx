interface UpgradeDialogProps {
    onClose: () => void;
}

export default function UpgradeDialog({ onClose }: UpgradeDialogProps) {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            features: [
                'Up to 10 videos',
                '1 audio file',
                '1 transition',
                'Basic support'
            ],
            current: true
        },
        {
            name: 'Premium',
            price: '$19/month',
            features: [
                'Up to 100 videos',
                'Unlimited audio files',
                '50+ transitions',
                'Priority support',
                'HD export',
                'No watermark'
            ],
            popular: true
        },
        {
            name: 'Custom',
            price: 'Contact Sales',
            features: [
                'Unlimited videos',
                'Custom transitions',
                'API access',
                'Dedicated support',
                '4K export',
                'White label'
            ]
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Choose Your Plan</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative border-2 rounded-xl p-6 ${plan.popular
                                ? 'border-purple-500 bg-purple-50'
                                : plan.current
                                    ? 'border-gray-300 bg-gray-50'
                                    : 'border-gray-200'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                <div className="text-3xl font-bold text-gray-900 mb-4">{plan.price}</div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.current
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : plan.popular
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-gray-800 text-white hover:bg-gray-900'
                                    }`}
                                disabled={plan.current}
                            >
                                {plan.current ? 'Current Plan' : plan.name === 'Custom' ? 'Contact Sales' : 'Upgrade Now'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}