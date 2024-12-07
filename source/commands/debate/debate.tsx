import React, {useEffect, useState} from 'react';
import {
	Debate,
	Statement,
	Debater,
	initializeDebate,
} from '../../conversations/debate.js';
import {Box, Text, useInput} from 'ink';
import {Spinner} from '@inkjs/ui';
import {useTextStream} from '../../utils/streaming.js';

type DebateProps = {
	topic: string;
	context: string;
};
export default function DebateView({topic, context}: DebateProps) {
	const [debate, setDebate] = useState<Debate>();

	useEffect(() => {
		(async () => {
			const debate = await initializeDebate({topic, context});
			if (debate) {
				setDebate(debate);
			}
		})();
	}, []);

	type Phase = 'introduction' | 'opening' | 'rebuttal' | 'closing';

	const [phase, setPhase] = useState<Phase>('opening');

	const [debaters, setDebaters] = useState<Debater[]>([]);

	useEffect(() => {
		if (debate) {
			const debaters = debate.positions.map(position => {
				return new Debater({
					position: position,
					debate,
				});
			});
			setDebaters(debaters);
		}
	}, [debate]);

	const phaseToBody: Record<Phase, JSX.Element | null> = {
		introduction: null,
		opening: debate ? (
			<OpeningPhase
				debate={debate}
				debaters={debaters}
				next={() => {
					setPhase('rebuttal');
				}}
			/>
		) : null,
		rebuttal: debate ? (
			<RebuttalPhase debate={debate} debaters={debaters} />
		) : null,
		closing: debate ? (
			<ClosingPhase debate={debate} debaters={debaters} />
		) : null,
	};

	return (
		<Box flexDirection="column" gap={1}>
			{!debate && <Spinner label="Initializing debate..." />}
			{debate && (
				<>
					<Box justifyContent="space-between">
						<Text color="cyan">{debate?.topic}</Text>
						<Text color="blue">{phase}</Text>
					</Box>
					{phaseToBody[phase]}
				</>
			)}
		</Box>
	);
}

type OpeningPhaseProps = {
	debate: Debate;
	debaters: Debater[];
	next: () => void;
};
function OpeningPhase({debate: _, debaters, next}: OpeningPhaseProps) {
	const [openingStatements, setOpeningStatements] = useState<Statement[]>([]);
	const [currentOpeningStatement, setCurrentOpeningStatement] = useState(0);
	const [loadingOpeningStatements, setLoadingOpeningStatements] =
		useState(true);

	const generateOpeningStatements = async () => {
		setLoadingOpeningStatements(true);
		const statements: Statement[] = [];
		for (const debater of debaters) {
			const statement = await debater.getOpeningStatement();
			if (!statement) {
				continue;
			}
			statements.push(statement);
		}
		setOpeningStatements(statements);
		setCurrentOpeningStatement(0);
		setLoadingOpeningStatements(false);
	};

	useEffect(() => {
		generateOpeningStatements();
	}, [debaters]);

	useInput(input => {
		if (input.toLowerCase() === 'n') {
			if (currentOpeningStatement === openingStatements.length - 1) {
				setCurrentOpeningStatement(currentOpeningStatement + 1);
			} else {
				next();
			}
		}
		if (input.toLowerCase() === 'p') {
			if (currentOpeningStatement > 0) {
				setCurrentOpeningStatement(currentOpeningStatement - 1);
			}
		}
	});

	const currentStatement = openingStatements[currentOpeningStatement];

	const {isComplete: greetingComplete, content: greeting} = useTextStream({
		content:
			"We welcome to the stage the following participants in today's debate...",
		space: 200,
		by: 'char',
	});

	const {isComplete: openingIntroComplete, content: openingIntro} =
		useTextStream({
			content: 'Now for our opening statements...',
			space: 200,
			by: 'word',
		});

	const isFirst = currentOpeningStatement === 0;

	return (
		<Box flexDirection={'column'}>
			<Text>
				{greetingComplete ? 'Greeting is complete' : "Greeting isn't complete."}
			</Text>
			<Text>{greeting}</Text>
			{greetingComplete && (
				<>
					<Text>{debaters.map(d => d.name).join(', ')}</Text>
					{debaters.map(debater => {
						return (
							<Box key={debater.name} marginBottom={1} flexDirection="column">
								<Text color={'green'}>{debater.name}</Text>
								<Text>{debater.position}</Text>
							</Box>
						);
					})}
					{currentStatement && (
						<Text>
							{currentOpeningStatement + 1}/{openingStatements.length}
							{' - '}
							press "n" to continue
							{!isFirst && (
								<>
									{' - '}
									press "p" to go back
								</>
							)}
						</Text>
					)}
					<Text>{openingIntro}</Text>
					{openingIntroComplete && (
						<>
							<Text>
								Please welcome {currentStatement?.debater.name} to the stage.
							</Text>
							{loadingOpeningStatements && (
								<Spinner label="Waiting for opening statements..." />
							)}
							{currentStatement && (
								<Box flexDirection="column">
									<Text color={'green'}>{currentStatement.debater.name}</Text>
									<Text>{currentStatement.content}</Text>
								</Box>
							)}
						</>
					)}
				</>
			)}
		</Box>
	);
}

type RebuttalPhaseProps = {
	debate: Debate;
	debaters: Debater[];
};
function RebuttalPhase({}: RebuttalPhaseProps) {
	return <Text>Rebuttal phase</Text>;
}

type ClosingPhaseProps = {
	debate: Debate;
	debaters: Debater[];
};
function ClosingPhase({}: ClosingPhaseProps) {
	return <Text>Closing phase</Text>;
}
