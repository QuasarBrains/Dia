import React, {useState} from 'react';
import {Box, Newline, Text, useApp, useInput} from 'ink';
import {Select, TextInput} from '@inkjs/ui';
import zod from 'zod';
import DebateView from './debate.js';

export const alias = 'd';

export const options = zod.object({});

type Props = {
	options: zod.infer<typeof options>;
};

type Step = 'topic' | 'context' | 'confirm' | 'debate';
export default function Index({options: _}: Props) {
	const {exit} = useApp();

	exit();

	console.log('This is a test');

	useInput((_, key) => {
		if (key.escape) {
			exit();
		}
	});

	const [step, setStep] = useState<Step>('topic');

	const [topic, setTopic] = useState('');
	const [context, setContext] = useState('');

	const submitTopic = (topic: string) => {
		setTopic(topic);
		setStep('context');
	};

	const submitContext = (context: string) => {
		setContext(context);
		setStep('confirm');
	};

	const confirm = async () => {
		setStep('debate');
	};

	const stepToBody = {
		topic: <GetTopic submitTopic={submitTopic} />,
		context: <GetContext submitContext={submitContext} />,
		confirm: (
			<Confirm
				setStep={setStep}
				confirm={confirm}
				topic={topic}
				context={context}
			/>
		),
		debate: <DebateView topic={topic} context={context} />,
	};

	return (
		<Box flexDirection="column" gap={1}>
			<Text color={'gray'}>
				Use 'esc' to exit. A transcript will be generated at the end. This is
				new.
			</Text>
			<Box>{stepToBody[step]}</Box>
		</Box>
	);
}

type GetTopicProps = {
	submitTopic: (topic: string) => void;
};
function GetTopic({submitTopic}: GetTopicProps) {
	const [topic, setTopic] = useState('');

	useInput((_, key) => {
		if (key.return) {
			submitTopic(topic);
		}
	});

	return (
		<Box marginRight={1}>
			<Text>Topic: </Text>
			<TextInput placeholder={'Your debate topic.'} onChange={setTopic} />
		</Box>
	);
}

type GetContextProps = {
	submitContext: (context: string) => void;
};
function GetContext({submitContext}: GetContextProps) {
	const [context, setContext] = useState('');

	useInput((_, key) => {
		if (key.return) {
			submitContext(context);
		}
	});

	return (
		<Box marginRight={1}>
			<Text>Any additional context?: </Text>
			<TextInput placeholder={'context.'} onChange={setContext} />
		</Box>
	);
}

type ConfirmProps = {
	topic: string;
	context: string;
	confirm: () => void;
	setStep: (step: Step) => void;
};
function Confirm({topic, context, confirm, setStep}: ConfirmProps) {
	return (
		<Box flexDirection={'column'}>
			<Text>
				<Text color={'cyan'}>{topic}</Text>
			</Text>
			<Text>{context}</Text>
			<Newline count={1} />
			<Text>Is this correct?</Text>
			<Select
				options={[
					{label: 'Yes, looks good.', value: 'yes'},
					{
						label: 'No, back to topic.',
						value: 'no-topic',
					},
					{
						label: 'No, back to context.',
						value: 'no-context',
					},
				]}
				onChange={value => {
					if (value === 'yes') {
						confirm();
					} else if (value === 'no-topic') {
						setStep('topic');
					} else {
						setStep('context');
					}
				}}
			/>
		</Box>
	);
}
