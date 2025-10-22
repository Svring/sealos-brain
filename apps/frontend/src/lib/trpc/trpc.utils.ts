/**
 * Creates a TRPC error formatter configuration with customShape
 * @returns Error formatter configuration object for TRPC create function
 */
export function createErrorFormatter() {
	return {
		errorFormatter({ shape }: { shape: any }) {
			return {
				...shape,
				data: {
					...shape.data,
					customShape: {
						status: shape.data.httpStatus || 500,
						path: shape.data.path,
						message: shape.message,
					},
				},
			};
		},
	};
}
