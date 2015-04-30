package br.com.estudo.modulo.modelo;

import java.io.Serializable;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class TipoCadastro implements Serializable {

    private Integer tipoCadastro;
    private String descricao;


    public Integer getTipoCadastro() {
        return tipoCadastro;
    }

    public void setTipoCadastro(Integer tipoCadastro) {
        this.tipoCadastro = tipoCadastro;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        TipoCadastro that = (TipoCadastro) o;

        if (descricao != null ? !descricao.equals(that.descricao) : that.descricao != null) return false;
        if (tipoCadastro != null ? !tipoCadastro.equals(that.tipoCadastro) : that.tipoCadastro != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = tipoCadastro != null ? tipoCadastro.hashCode() : 0;
        result = 31 * result + (descricao != null ? descricao.hashCode() : 0);
        return result;
    }

    public TipoCadastro(Integer tipoCadastro, String descricao) {
        this.tipoCadastro = tipoCadastro;
        this.descricao = descricao;
    }

    public TipoCadastro() {
    }

    @Override
    public String toString() {
        return "TipoCadastro{" +
                "tipoCadastro=" + tipoCadastro +
                ", descricao='" + descricao + '\'' +
                '}';
    }

    public TipoCadastro(String descricao) {
        this.descricao = descricao;
    }
}
