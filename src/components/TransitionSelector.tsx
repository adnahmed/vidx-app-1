const TRANSITIONS = [
    { id: 'fade', name: 'Fade', preview: '→' },
    { id: 'slide', name: 'Slide', preview: '➡' },
    { id: 'wipe', name: 'Wipe', preview: '⟼' },
    { id: 'dissolve', name: 'Dissolve', preview: '⋄' },
    { id: 'zoom', name: 'Zoom', preview: '⊕' },
    { id: 'rotate', name: 'Rotate', preview: '↻' },
    { id: 'flip', name: 'Flip', preview: '⤸' },
    { id: 'push', name: 'Push', preview: '⇨' },
    { id: 'cover', name: 'Cover', preview: '▦' },
    { id: 'reveal', name: 'Reveal', preview: '▨' },
    // Add more transitions up to 50+
];

interface TransitionSelectorProps {
    selectedTransition: string;
    onSelect: (transitionId: string) => void;
}

export default function TransitionSelector({ selectedTransition, onSelect }: TransitionSelectorProps) {
    return (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
						{TRANSITIONS.map((transition) => (
							<button
								type="button"
								key={transition.id}
								onClick={() => onSelect(transition.id)}
								className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
									selectedTransition === transition.id
										? "border-purple-500 bg-purple-50"
										: "border-gray-200 hover:border-gray-300"
								}`}
							>
								{selectedTransition === transition.id && (
									<div className="absolute top-2 left-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
										<svg
											aria-label={"Selected"}
											role="img"
											className="w-3 h-3 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
								)}
								<div className="text-center">
									<div className="text-2xl mb-2">{transition.preview}</div>
									<div className="text-sm font-medium text-gray-700">
										{transition.name}
									</div>
								</div>
							</button>
						))}
					</div>
				);
}