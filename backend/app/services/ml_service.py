from model import mitigate_bias, train_model


def run_training(df, use_gender: bool):
    model, x_test, y_test, sensitive = train_model(df, use_gender)
    y_pred = model.predict(x_test)
    return y_test, y_pred, sensitive


def run_mitigation(df, use_gender: bool):
    _, _, y_test, sensitive, y_pred_mitigated = mitigate_bias(df, use_gender)
    return y_test, y_pred_mitigated, sensitive
