import "./Button.scss";

type ButtonProps = {
  button: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
};

function Button(props: ButtonProps) {
  return <div className="Button">{props.button}</div>;
}

export default Button;
