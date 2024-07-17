import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { EDIT_AUTHOR } from "../services/queries";
import Select from "react-select";

export default function EditBorn({ authors }) {
	const [selectedOption, setSelectedOption] = useState(null);
	const [born, setBorn] = useState("");

	const [editBorn, result] = useMutation(EDIT_AUTHOR, {
		onError: (error) => {
			console.log(error.message);
		},
	});

	const options = authors?.map((author) => ({
		value: author.name,
		label: author.name,
	}));

	useEffect(() => {
		if (result.data && result.data.editNumber === null) {
			console.log("person not found");
		}
	}, [result.data]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		editBorn({ variables: { name: selectedOption.value, born } });

		setBorn("");
	};

	return (
		<>
			<h2>Edit author</h2>
			<form
				onSubmit={handleSubmit}
				style={{
					display: "flex",
					flexDirection: "column",
					width: "10rem",
				}}>
				<label htmlFor="">
					Name:
					<Select
						defaultValue={selectedOption}
						onChange={setSelectedOption}
						options={options}
					/>
				</label>
				<label htmlFor="">
					Born:
					<input
						type="text"
						value={born}
						onChange={({ target }) =>
							setBorn(parseInt(target.value))
						}
					/>
				</label>
				<input type="submit" value="Submit" />
			</form>
		</>
	);
}
