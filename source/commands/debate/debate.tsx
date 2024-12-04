import React, {useEffect, useState} from 'react';
import {Debate, Statement} from '../../conversations/debate.js';
import {Debater, initializeDebate} from '../../conversations/debate.js';
import {Box, Text} from 'ink';
import {Spinner} from '@inkjs/ui';

type DebateProps = {
	topic: string;
	context: string;
};
export default function DebateView({topic, context}: DebateProps) {
	const [debate, setDebate] = useState<Debate>();

	useEffect(() => {
		(async () => {
			const debate = await initializeDebate({topic, context});
			setDebate(debate);
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
function OpeningPhase({debate: _, debaters, next: __}: OpeningPhaseProps) {
	const [openingStatements, setOpeningStatements] = useState<Statement[]>([]);
	const [loadingOpeningStatements, setLoadingOpeningStatements] =
		useState(true);

	const generateOpeningStatements = async () => {
		setLoadingOpeningStatements(true);
		const statements = [];
		for (const debater of debaters) {
			console.info(`Getting ${debater.name}'s Opening Statement`);
			const statement = await debater.getOpeningStatement();
			if (!statement) {
				continue;
			}
			statements.push(statement);
		}
		setOpeningStatements(statements);
		setLoadingOpeningStatements(false);
	};

	useEffect(() => {
		setTimeout(() => {
			generateOpeningStatements();
		}, 500);
	}, []);

	return (
		<Box flexDirection={'column'}>
			<Text>
				We welcome to the stage the following participants in today's debate...
			</Text>
			<Box marginBottom={1} flexWrap="wrap">
				{debaters.map(debater => {
					return (
						<Box key={debater.name} marginBottom={1} flexDirection="column">
							<Text color={'green'}>{debater.name}</Text>
							<Text>{debater.position}</Text>
						</Box>
					);
				})}
			</Box>
			<Box marginBottom={1}>
				<Text>Now for opening statements...</Text>
				{loadingOpeningStatements && (
					<Spinner label="Waiting for opening statements..." />
				)}
				{openingStatements.map(statement => (
					<Box key={statement.name} marginBottom={1} flexDirection="column">
						<Text color="green">{statement.name}</Text>
						<Text italic>{statement.content}</Text>
					</Box>
				))}
			</Box>
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
