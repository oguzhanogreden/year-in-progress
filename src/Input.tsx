import "./Input.scss";

type InputProps = {
  label: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >;
  input: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
};

function Input(props: InputProps) {
  return (
    <div className="Input">
      {props.label}
      {props.input}
    </div>
  );
}

export default Input;
