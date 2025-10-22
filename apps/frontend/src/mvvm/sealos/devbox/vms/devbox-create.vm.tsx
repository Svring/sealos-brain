import { useForm } from "@tanstack/react-form";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	DEVBOX_CPU_OPTIONS,
	DEVBOX_MEMORY_OPTIONS,
} from "@/constants/devbox/devbox-resource.constant";
import { DEVBOX_RUNTIMES } from "@/constants/devbox/devbox-runtime.constant";
import { useQuota } from "@/hooks/k8s/use-quota";
import { validateCreationByQuota } from "@/lib/sealos/quota/quota.utils";
import { devboxCreateSchema } from "../models/devbox-create.model";

export function DevboxCreate() {
	const { data: quota } = useQuota();

	const form = useForm({
		defaultValues: devboxCreateSchema.parse({}),
		validators: {
			onSubmit: ({ value }) => {
				if (!quota) {
					return { success: false, errors: ["quota not found."] };
				}
				const validated = devboxCreateSchema.parse(value);
				return validateCreationByQuota([validated], quota);
			},
		},
		onSubmit: async () => {
			toast.success("Devbox created successfully");
		},
	});

	return (
		<Card className="w-full sm:max-w-2xl">
			<CardHeader>
				<CardTitle>Create Devbox</CardTitle>
				<CardDescription>
					Configure and create your development environment.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="devbox-create"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						{/* Name Field */}
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Name</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="devbox-name"
											autoComplete="off"
										/>
										<FieldDescription>
											Name of your devbox instance.
										</FieldDescription>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						{/* Runtime Field */}
						<form.Field
							name="runtime"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field orientation="responsive" data-invalid={isInvalid}>
										<FieldContent>
											<FieldLabel htmlFor={field.name}>Runtime</FieldLabel>
											<FieldDescription>
												Select the runtime environment for your devbox.
											</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</FieldContent>
										<Select
											name={field.name}
											value={field.state.value}
											onValueChange={(value) =>
												field.handleChange(value as typeof field.state.value)
											}
										>
											<SelectTrigger
												id={field.name}
												aria-invalid={isInvalid}
												className="min-w-[180px]"
											>
												<SelectValue placeholder="Select runtime" />
											</SelectTrigger>
											<SelectContent position="item-aligned">
												{DEVBOX_RUNTIMES.map((runtime) => (
													<SelectItem key={runtime} value={runtime}>
														{runtime}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>
								);
							}}
						/>

						{/* Resource Fields */}
						<FieldSet>
							<FieldLegend>Resources</FieldLegend>
							<FieldDescription>
								Configure CPU and memory for your devbox.
							</FieldDescription>
							<FieldGroup>
								{/* CPU Field */}
								<form.Field
									name="resource.cpu"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field orientation="responsive" data-invalid={isInvalid}>
												<FieldContent>
													<FieldLabel htmlFor={field.name}>CPU</FieldLabel>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</FieldContent>
												<Select
													name={field.name}
													value={field.state.value?.toString()}
													onValueChange={(value) =>
														field.handleChange(Number(value))
													}
												>
													<SelectTrigger
														id={field.name}
														aria-invalid={isInvalid}
														className="min-w-[120px]"
													>
														<SelectValue placeholder="CPU" />
													</SelectTrigger>
													<SelectContent position="item-aligned">
														{DEVBOX_CPU_OPTIONS.map((cpu) => (
															<SelectItem key={cpu} value={cpu.toString()}>
																{cpu} Core{cpu > 1 ? "s" : ""}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</Field>
										);
									}}
								/>

								{/* Memory Field */}
								<form.Field
									name="resource.memory"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field orientation="responsive" data-invalid={isInvalid}>
												<FieldContent>
													<FieldLabel htmlFor={field.name}>Memory</FieldLabel>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</FieldContent>
												<Select
													name={field.name}
													value={field.state.value?.toString()}
													onValueChange={(value) =>
														field.handleChange(Number(value))
													}
												>
													<SelectTrigger
														id={field.name}
														aria-invalid={isInvalid}
														className="min-w-[120px]"
													>
														<SelectValue placeholder="Memory" />
													</SelectTrigger>
													<SelectContent position="item-aligned">
														{DEVBOX_MEMORY_OPTIONS.map((memory) => (
															<SelectItem
																key={memory}
																value={memory.toString()}
															>
																{memory} GB
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</Field>
										);
									}}
								/>
							</FieldGroup>
						</FieldSet>

						{/* Ports Array Field */}
						<form.Field
							name="ports"
							mode="array"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<FieldSet>
										<FieldLegend variant="label">Ports</FieldLegend>
										<FieldDescription>
											Configure ports for your devbox (max 10).
										</FieldDescription>
										<FieldGroup>
											{field.state.value.map((item, index) => (
												<div
													key={`${item.number}-${index}`}
													className="space-y-4"
												>
													{/* Port Number */}
													<form.Field
														name={`ports[${index}].number`}
														children={(subField) => {
															const isSubFieldInvalid =
																subField.state.meta.isTouched &&
																!subField.state.meta.isValid;
															return (
																<Field data-invalid={isSubFieldInvalid}>
																	<FieldLabel htmlFor={subField.name}>
																		Port {index + 1}
																	</FieldLabel>
																	<InputGroup>
																		<InputGroupInput
																			id={subField.name}
																			name={subField.name}
																			type="number"
																			value={subField.state.value}
																			onBlur={subField.handleBlur}
																			onChange={(e) =>
																				subField.handleChange(
																					Number(e.target.value),
																				)
																			}
																			aria-invalid={isSubFieldInvalid}
																			placeholder="8080"
																			min={1}
																			max={65535}
																		/>
																		{field.state.value.length > 0 && (
																			<InputGroupAddon align="inline-end">
																				<InputGroupButton
																					type="button"
																					variant="ghost"
																					size="icon-xs"
																					onClick={() =>
																						field.removeValue(index)
																					}
																					aria-label={`Remove port ${index + 1}`}
																				>
																					<XIcon />
																				</InputGroupButton>
																			</InputGroupAddon>
																		)}
																	</InputGroup>
																	{isSubFieldInvalid && (
																		<FieldError
																			errors={subField.state.meta.errors}
																		/>
																	)}
																</Field>
															);
														}}
													/>

													{/* Port Protocol */}
													<form.Field
														name={`ports[${index}].protocol`}
														children={(subField) => {
															const isSubFieldInvalid =
																subField.state.meta.isTouched &&
																!subField.state.meta.isValid;
															return (
																<Field
																	orientation="responsive"
																	data-invalid={isSubFieldInvalid}
																>
																	<FieldContent>
																		<FieldLabel htmlFor={subField.name}>
																			Protocol
																		</FieldLabel>
																		{isSubFieldInvalid && (
																			<FieldError
																				errors={subField.state.meta.errors}
																			/>
																		)}
																	</FieldContent>
																	<Select
																		name={subField.name}
																		value={subField.state.value}
																		onValueChange={(value) =>
																			subField.handleChange(
																				value as typeof subField.state.value,
																			)
																		}
																	>
																		<SelectTrigger
																			id={subField.name}
																			aria-invalid={isSubFieldInvalid}
																			className="min-w-[120px]"
																		>
																			<SelectValue placeholder="Protocol" />
																		</SelectTrigger>
																		<SelectContent position="item-aligned">
																			<SelectItem value="HTTP">HTTP</SelectItem>
																			<SelectItem value="GRPC">GRPC</SelectItem>
																			<SelectItem value="WS">WS</SelectItem>
																		</SelectContent>
																	</Select>
																</Field>
															);
														}}
													/>

													{/* Exposes Public Domain Switch */}
													<form.Field
														name={`ports[${index}].exposesPublicDomain`}
														children={(subField) => {
															const isSubFieldInvalid =
																subField.state.meta.isTouched &&
																!subField.state.meta.isValid;
															return (
																<Field
																	orientation="horizontal"
																	data-invalid={isSubFieldInvalid}
																>
																	<FieldContent>
																		<FieldLabel htmlFor={subField.name}>
																			Expose Public Domain
																		</FieldLabel>
																		<FieldDescription>
																			Make this port publicly accessible.
																		</FieldDescription>
																		{isSubFieldInvalid && (
																			<FieldError
																				errors={subField.state.meta.errors}
																			/>
																		)}
																	</FieldContent>
																	<Switch
																		id={subField.name}
																		name={subField.name}
																		checked={subField.state.value}
																		onCheckedChange={subField.handleChange}
																		aria-invalid={isSubFieldInvalid}
																	/>
																</Field>
															);
														}}
													/>
												</div>
											))}
										</FieldGroup>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												field.pushValue({
													number: 8080,
													protocol: "HTTP",
													exposesPublicDomain: true,
												})
											}
											disabled={field.state.value.length >= 10}
										>
											Add Port
										</Button>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</FieldSet>
								);
							}}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Field orientation="horizontal">
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						Reset
					</Button>
					<Button type="submit" form="devbox-create">
						Create Devbox
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
