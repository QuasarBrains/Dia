import {useEffect, useState, useRef} from 'react';

type UseTextStreamProps = {
	content: string;
	space: number;
	by: 'word' | 'char';
	onComplete?: () => void;
};

export function useTextStream({
	content,
	space,
	by,
	onComplete,
}: UseTextStreamProps) {
	const [displayedText, setDisplayedText] = useState('');
	const indexRef = useRef(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const [isComplete, setIsComplete] = useState(false);

	const handleComplete = () => {
		if (onComplete) {
			onComplete();
		}
		setIsComplete(true);
	};

	useEffect(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		indexRef.current = 0;
		setDisplayedText('');

		const updateText = () => {
			if (by === 'char') {
				if (indexRef.current < content.length) {
					setDisplayedText(prev => prev + content[indexRef.current]);
					indexRef.current += 1;
				} else {
					clearInterval(intervalRef.current!);
					if (onComplete) handleComplete();
				}
			} else if (by === 'word') {
				const words = content.split(' ');
				if (indexRef.current < words.length) {
					setDisplayedText(prev => {
						const word = words[indexRef.current];
						if (!word) {
							return '';
						}
						return prev ? prev + ' ' + word : word;
					});
					indexRef.current += 1;
				} else {
					clearInterval(intervalRef.current!);
					if (onComplete) handleComplete();
				}
			}
		};

		intervalRef.current = setInterval(updateText, space);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [content, space, by, onComplete]);

	return {
		content: displayedText,
		isComplete,
	};
}
